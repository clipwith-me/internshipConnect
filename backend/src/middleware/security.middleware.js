// backend/src/middleware/security.middleware.js

import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';

/**
 * 🔒 MICROSOFT-GRADE SECURITY MIDDLEWARE
 *
 * Implements enterprise-level security protections:
 * - Rate limiting (brute-force protection)
 * - Input sanitization (NoSQL injection prevention)
 * - XSS protection
 * - Security headers
 * - Request size limits
 */

// ═══════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════

/**
 * General API rate limiter
 * Prevents abuse of API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests in test/dev
  skip: (req) => process.env.NODE_ENV === 'test'
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute-force attacks on login/register
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Password reset rate limiter
 * Prevents password reset spam
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again after 1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * File upload rate limiter
 * Prevents upload spam
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per window
  message: {
    success: false,
    message: 'Too many file uploads, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Payment endpoint rate limiter
 * Extra strict for payment operations
 */
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 payment requests per window
  message: {
    success: false,
    message: 'Too many payment requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Profile update rate limiter
 * Prevents spam profile updates and potential DoS
 */
export const profileUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 profile updates per window
  message: {
    success: false,
    message: 'Too many profile updates, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ═══════════════════════════════════════════════════════════
// INPUT SANITIZATION
// ═══════════════════════════════════════════════════════════

/**
 * NoSQL Injection Protection
 * Removes $ and . from request data
 */
export const sanitizeInput = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️  Sanitized potentially malicious input: ${key}`);
  }
});

/**
 * XSS Protection
 * Cleans user input from malicious HTML/JavaScript
 */
export const preventXSS = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    });
  }

  // Sanitize query params
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key]);
      }
    });
  }

  // Sanitize params
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = xss(req.params[key]);
      }
    });
  }

  next();
};

/**
 * Custom input validator
 * Additional validation beyond express-validator
 */
export const validateInput = (req, res, next) => {
  // Check for common SQL injection patterns (defense in depth)
  const sqlInjectionPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi;

  const checkForSQLInjection = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        if (sqlInjectionPatterns.test(obj[key])) {
          return true;
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkForSQLInjection(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (checkForSQLInjection(req.body) || checkForSQLInjection(req.query) || checkForSQLInjection(req.params)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected'
    });
  }

  next();
};

// ═══════════════════════════════════════════════════════════
// SECURITY HEADERS
// ═══════════════════════════════════════════════════════════

/**
 * Enhanced security headers middleware
 * Adds Microsoft-recommended security headers
 */
export const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS Protection (for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (formerly Feature Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://api.stripe.com; " +
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com;"
  );

  // HTTPS enforcement (HSTS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Remove X-Powered-By header (hide Express)
  res.removeHeader('X-Powered-By');

  next();
};

// ═══════════════════════════════════════════════════════════
// REQUEST VALIDATION
// ═══════════════════════════════════════════════════════════

/**
 * Validate request size
 * Prevents large payload attacks
 */
export const validateRequestSize = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request payload too large'
    });
  }

  next();
};

/**
 * HTTPS redirect (production only)
 */
export const enforceHTTPS = (req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.get('host')}${req.url}`);
  }
  next();
};

/**
 * Prevent parameter pollution
 */
export const preventParamPollution = (req, res, next) => {
  // Check for duplicate parameters
  const checkDuplicates = (obj) => {
    const seen = new Set();
    for (const key in obj) {
      if (seen.has(key)) {
        return true;
      }
      seen.add(key);
    }
    return false;
  };

  if (checkDuplicates(req.query)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request parameters'
    });
  }

  next();
};

// ═══════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════

/**
 * Secure error handler
 * Prevents information leakage in error messages
 */
export const secureErrorHandler = (err, req, res, next) => {
  // Log full error internally
  console.error('🔴 Security Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Send sanitized error to client
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An error occurred'
    : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export default {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  paymentLimiter,
  profileUpdateLimiter,
  sanitizeInput,
  preventXSS,
  validateInput,
  securityHeaders,
  validateRequestSize,
  enforceHTTPS,
  preventParamPollution,
  secureErrorHandler
};
