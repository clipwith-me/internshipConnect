// backend/src/controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import { User, StudentProfile, OrganizationProfile } from '../models/index.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/email.service.js';
/**
 * 🎓 LEARNING: Authentication Controller
 * 
 * Handles user registration, login, and token management.
 * 
 * Key concepts:
 * - Password hashing (bcrypt - done in User model)
 * - JWT tokens for stateless authentication
 * - Refresh tokens for security
 * - Role-based profile creation
 */

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Generate JWT access token
 * Short-lived (15 minutes)
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

/**
 * Generate JWT refresh token
 * Long-lived (7 days)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Generate both tokens
 */
const generateTokens = (userId) => {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId)
  };
};

// ═══════════════════════════════════════════════════════════
// REGISTER NEW USER
// ═══════════════════════════════════════════════════════════

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (student or organization)
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { email, password, role, ...profileData } = req.body;
    
    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and role are required'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Create user
    const user = await User.create({
      email,
      password,  // Will be hashed by pre-save hook
      role
    });
    
    // Create role-specific profile
    let profile;
    if (role === 'student') {
      profile = await StudentProfile.create({
        user: user._id,
        personalInfo: {
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || ''
        }
      });
    } else if (role === 'organization') {
      profile = await OrganizationProfile.create({
        user: user._id,
        companyInfo: {
          name: profileData.companyName || 'New Organization',
          industry: profileData.industry || 'technology',
          companySize: profileData.companySize || '1-10',
          headquarters: {
            city: profileData.city || 'Not specified',
            country: profileData.country || 'Not specified'
          }
        },
        description: {
          short: profileData.shortDescription || 'A new organization on InternshipConnect',
          full: profileData.fullDescription || 'This organization is setting up their profile. Check back soon for more information!'
        },
        contactInfo: {
          primaryEmail: email
        }
      });
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Send welcome email (don't block registration if it fails)
    try {
      const userName = role === 'student'
        ? (profileData.firstName || user.email.split('@')[0])
        : (profileData.companyName || 'there');

      await sendWelcomeEmail({
        to: email,
        userName,
        role
      });

      console.log(`📧 Welcome email sent to: ${email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    // Return user data (without password)
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          subscription: user.subscription
        },
        profile: profile,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
    
  } catch (error) {
    console.error('Register error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Handle duplicate key error (E11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field === 'email' ? 'Email' : field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }

    // Handle database connection errors
    if (error.name === 'MongooseError' || error.name === 'MongoError' ||
        error.message.includes('buffering timed out') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('Server selection timed out')) {
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable. Please try again in a moment.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ═══════════════════════════════════════════════════════════
// LOGIN USER
// ═══════════════════════════════════════════════════════════

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return tokens
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user with password (normally excluded)
    const user = await User.findByCredentials(email, password);
    
    // Load profile based on role
    let profile;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id });
    } else if (user.role === 'organization') {
      profile = await OrganizationProfile.findOne({ user: user._id });
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          subscription: user.subscription
        },
        profile: profile,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);

    // Handle specific errors
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (error.message.includes('locked')) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to multiple failed login attempts'
      });
    }

    // Handle database connection errors
    if (error.name === 'MongooseError' || error.name === 'MongoError' ||
        error.message.includes('buffering timed out') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('Server selection timed out')) {
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable. Please try again in a moment.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ═══════════════════════════════════════════════════════════
// REFRESH TOKEN
// ═══════════════════════════════════════════════════════════

/**
 * @route   POST /api/auth/refresh
 * @desc    Get new access token using refresh token
 * @access  Public
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
    
    // Generate new access token
    const accessToken = generateAccessToken(decoded.userId);
    
    res.json({
      success: true,
      data: {
        accessToken
      }
    });
    
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

// ═══════════════════════════════════════════════════════════
// GET CURRENT USER
// ═══════════════════════════════════════════════════════════

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    // ✅ FIX: req.user is set by auth middleware with _id property, not userId
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Load profile
    let profile;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id });
    } else if (user.role === 'organization') {
      profile = await OrganizationProfile.findOne({ user: user._id });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          subscription: user.subscription
        },
        profile: profile
      }
    });
    
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// LOGOUT USER
// ═══════════════════════════════════════════════════════════

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
export const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // by removing the tokens from storage
    
    // Optional: Add token to blacklist if implementing token revocation
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// FORGOT PASSWORD
// ═══════════════════════════════════════════════════════════

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findByEmail(email);
    
    if (!user) {
      // Don't reveal if email exists (security)
      return res.json({
        success: true,
        message: 'If that email exists, a reset link has been sent'
      });
    }
    
    // Generate reset token
    const resetToken = user.generateResetToken();
    await user.save();

    // Send password reset email
    try {
      await sendPasswordResetEmail({
        to: email,
        resetToken,
        userName: user.email.split('@')[0] // Use email username as fallback
      });

      console.log(`📧 Password reset email sent to: ${email}`);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Password reset link sent to email',
      // For development only - remove in production
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// RESET PASSWORD
// ═══════════════════════════════════════════════════════════

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }
    
    // Hash token and find user
    const crypto = await import('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }
    
    // Update password (will be hashed by pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password reset successful'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// CHANGE PASSWORD (AUTHENTICATED)
// ═══════════════════════════════════════════════════════════

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password for authenticated user
 * @access  Private
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

/**
 * 🎓 USAGE IN ROUTES:
 *
 * import * as authController from '../controllers/auth.controller.js';
 *
 * router.post('/register', authController.register);
 * router.post('/login', authController.login);
 * router.post('/refresh', authController.refreshToken);
 * router.get('/me', authMiddleware, authController.getMe);
 * router.post('/logout', authMiddleware, authController.logout);
 * router.put('/change-password', authMiddleware, authController.changePassword);
 */