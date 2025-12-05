// backend/src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

/**
 * 🎓 LEARNING: Authentication Middleware
 * 
 * Protects routes by verifying JWT tokens.
 * 
 * How it works:
 * 1. Extract token from Authorization header
 * 2. Verify token with JWT secret
 * 3. Decode user ID from token
 * 4. Attach user to request object
 * 5. Allow request to proceed
 */

// ═══════════════════════════════════════════════════════════
// AUTHENTICATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    // Format: "Bearer <token>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer "
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Attach user info to request
    req.user = {
      _id: user._id,
      email: user.email,
      role: user.role,
      subscription: user.subscription
    };
    
    next(); // Proceed to next middleware/route handler
    
  } catch (error) {
    // ✅ PRODUCTION: Only log unexpected errors, not expected token validation failures
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    // Log only unexpected authentication errors (database, network, etc.)
    console.error('❌ Unexpected auth error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'production' ? 'Internal error' : error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// ROLE-BASED AUTHORIZATION
// ═══════════════════════════════════════════════════════════

/**
 * Check if user has required role
 * Usage: authorize('student'), authorize('organization', 'admin')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }
    
    next();
  };
};

// ═══════════════════════════════════════════════════════════
// SUBSCRIPTION CHECK
// ═══════════════════════════════════════════════════════════

/**
 * Check if user has required subscription plan
 * Usage: requireSubscription('premium'), requireSubscription('premium', 'enterprise')
 */
export const requireSubscription = (...plans) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    if (!plans.includes(req.user.subscription.plan)) {
      return res.status(403).json({
        success: false,
        message: `This feature requires ${plans.join(' or ')} subscription`,
        upgradeUrl: '/pricing'
      });
    }
    
    if (req.user.subscription.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Subscription is not active',
        renewUrl: '/subscription/renew'
      });
    }
    
    next();
  };
};

// ═══════════════════════════════════════════════════════════
// FEATURE CHECK
// ═══════════════════════════════════════════════════════════

/**
 * Check if user has access to specific feature
 * Usage: requireFeature('aiResumeBuilder')
 */
export const requireFeature = (featureName) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // ✅ FIX: Use req.user._id (set by authenticate middleware), not req.user.userId
    const user = await User.findById(req.user._id);
    
    if (!user.hasFeature(featureName)) {
      return res.status(403).json({
        success: false,
        message: `This feature is not available in your plan`,
        feature: featureName,
        upgradeUrl: '/pricing'
      });
    }
    
    next();
  };
};

// ═══════════════════════════════════════════════════════════
// OPTIONAL AUTHENTICATION
// ═══════════════════════════════════════════════════════════

/**
 * Authenticates user if token is present, but doesn't fail if not
 * Useful for routes that work differently for authenticated users
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token, proceed without authentication
      req.user = null;
      return next();
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    
    if (user && user.isActive) {
      req.user = {
        userId: user._id,
        email: user.email,
        role: user.role,
        subscription: user.subscription
      };
    } else {
      req.user = null;
    }
    
    next();
    
  } catch (error) {
    // Token invalid, proceed without authentication
    req.user = null;
    next();
  }
};

/**
 * 🎓 USAGE EXAMPLES:
 * 
 * // Protected route (requires authentication)
 * router.get('/profile', authenticate, profileController.getProfile);
 * 
 * // Role-based protection
 * router.post('/internships', authenticate, authorize('organization'), createInternship);
 * 
 * // Multiple roles allowed
 * router.get('/dashboard', authenticate, authorize('student', 'organization'), getDashboard);
 * 
 * // Subscription check
 * router.post('/ai/resume', authenticate, requireSubscription('premium', 'enterprise'), generateResume);
 * 
 * // Feature check
 * router.post('/resume/ai-generate', authenticate, requireFeature('aiResumeBuilder'), generateResume);
 * 
 * // Optional auth (public route with extra features for authenticated users)
 * router.get('/internships', optionalAuth, getInternships);
 * // In controller: if (req.user) { // Show saved status } else { // Don't show }
 * 
 * // Chain multiple middlewares
 * router.post('/featured-listing',
 *   authenticate,
 *   authorize('organization'),
 *   requireSubscription('premium', 'enterprise'),
 *   createFeaturedListing
 * );
 */