// backend/src/middleware/validation.middleware.js

/**
 * 🎓 LEARNING: Validation Middleware
 *
 * This middleware processes validation results from express-validator.
 *
 * Why we validate:
 * - Security: Prevent injection attacks
 * - Data integrity: Ensure data meets expectations
 * - User experience: Provide clear error messages
 * - Database performance: Don't send bad data to DB
 *
 * Microsoft Principle:
 * "Fail fast - validate at the edge before processing begins"
 */

import { validationResult } from 'express-validator';

/**
 * Validation middleware
 * Checks for validation errors and returns formatted response
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format errors for consistent API response
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: formattedErrors
    });
  }

  // No errors, proceed to next middleware/controller
  next();
};

export default validate;
