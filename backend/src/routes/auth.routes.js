// backend/src/routes/auth.routes.js
import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
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