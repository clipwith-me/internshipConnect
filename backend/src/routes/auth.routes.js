// backend/src/routes/auth.routes.js
import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authLimiter, passwordResetLimiter } from '../middleware/security.middleware.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

/**
 * 🎓 LEARNING: API Routes
 * 
 * Routes define the URL patterns and HTTP methods for your API.
 * They connect URLs to controller functions.
 * 
 * Structure:
 * - Route definition (POST, GET, etc.)
 * - Validation middleware (optional)
 * - Authentication middleware (if protected)
 * - Controller function
 */

// ═══════════════════════════════════════════════════════════
// VALIDATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════

/**
 * Validation error handler
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// ═══════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register',
  authLimiter, // Rate limiting for brute-force protection
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
    body('role')
      .isIn(['student', 'organization'])
      .withMessage('Role must be student or organization'),
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('First name must be at least 2 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Last name must be at least 2 characters'),
    body('companyName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Company name must be at least 2 characters'),
    validate
  ],
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
  authLimiter, // Rate limiting for brute-force protection
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    validate
  ],
  authController.login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
    validate
  ],
  authController.refreshToken
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me',
  authenticate,
  authController.getMe
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout',
  authenticate,
  authController.logout
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password',
  passwordResetLimiter, // Strict rate limiting for password reset
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    validate
  ],
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password/:token',
  passwordResetLimiter, // Strict rate limiting for password reset
  [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
    validate
  ],
  authController.resetPassword
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password for authenticated user
 * @access  Private
 */
router.put('/change-password',
  authenticate,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
    validate
  ],
  authController.changePassword
);

// ─── One-time admin bootstrap (guarded by ADMIN_RESET_SECRET env var) ────────
// DELETE this route once you have successfully logged in as admin.
router.post('/bootstrap-admin', async (req, res) => {
  try {
    const { secret, email, newPassword } = req.body;

    const expectedSecret = process.env.ADMIN_RESET_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const User = (await import('../models/User.js')).default;
    const bcrypt = (await import('bcryptjs')).default;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hash = await bcrypt.hash(newPassword, 10);
    await User.updateOne(
      { _id: user._id },
      { $set: { password: hash, loginAttempts: 0, role: 'admin' }, $unset: { lockUntil: '' } }
    );

    res.json({ success: true, message: 'Admin password reset. Delete this endpoint now.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

/**
 * 🎓 HOW TO USE IN server.js:
 * 
 * import authRoutes from './routes/auth.routes.js';
 * 
 * app.use('/api/auth', authRoutes);
 * 
 * This mounts all routes:
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - POST /api/auth/refresh
 * - GET  /api/auth/me
 * - POST /api/auth/logout
 * - POST /api/auth/forgot-password
 * - POST /api/auth/reset-password/:token
 */