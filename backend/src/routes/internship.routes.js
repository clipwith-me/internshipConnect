// backend/src/routes/internship.routes.js

/**
 * 🎓 LEARNING: RESTful API Route Design
 *
 * REST Principles we follow:
 * - GET: Retrieve data (idempotent - can be called multiple times)
 * - POST: Create new resources
 * - PUT: Update entire resource
 * - PATCH: Update part of resource
 * - DELETE: Remove resource
 *
 * URL Structure:
 * - /api/internships - Collection endpoint
 * - /api/internships/:id - Single resource endpoint
 * - /api/internships/:id/publish - Action on resource
 *
 * Microsoft Principle:
 * "APIs should be intuitive - developers shouldn't need documentation to guess the endpoint"
 */

import express from 'express';
import { body } from 'express-validator';
import {
  getInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
  getMyInternships,
  publishInternship
} from '../controllers/internship.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

/**
 * 🎓 VALIDATION RULES
 *
 * We validate input at the route level before it reaches the controller.
 * This keeps controllers clean and focused on business logic.
 */
const internshipValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Description must be between 50 and 5000 characters'),

  body('requirements.description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Requirements description cannot exceed 2000 characters'),

  body('location.type')
    .isIn(['remote', 'onsite', 'hybrid'])
    .withMessage('Location type must be remote, onsite, or hybrid'),

  body('location.city')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City name must be between 2 and 100 characters'),

  body('location.country')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country name must be between 2 and 100 characters'),

  body('compensation.type')
    .isIn(['paid', 'unpaid', 'stipend', 'commission', 'negotiable'])
    .withMessage('Compensation type must be paid, unpaid, stipend, commission, or negotiable'),

  body('compensation.amount.min')
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage('Minimum compensation amount must be a number'),

  body('compensation.amount.max')
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage('Maximum compensation amount must be a number'),

  body('duration.length')
    .notEmpty()
    .withMessage('Duration length is required'),

  body('timeline.startDate')
    .notEmpty()
    .isISO8601()
    .withMessage('Start date is required and must be a valid date'),

  body('timeline.applicationDeadline')
    .notEmpty()
    .isISO8601()
    .withMessage('Application deadline is required and must be a valid date'),

  body('timeline.endDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('End date must be a valid date'),

  validate // Middleware that processes validation results
];

/**
 * 🎓 ROUTE DEFINITIONS
 *
 * Routes are ordered from most specific to least specific.
 * This prevents route conflicts (e.g., /my-internships before /:id)
 */

// Public routes (no authentication needed)
router.get('/', getInternships); // GET /api/internships

// Protected routes (authentication required)
router.use(authenticate); // All routes below require authentication

// IMPORTANT: Specific routes MUST come before dynamic /:id routes
// ✅ SECURITY FIX: Add role-based authorization for organization-only routes
router.get('/my-internships', authorize('organization'), getMyInternships); // GET /api/internships/my-internships
router.post('/', authorize('organization'), internshipValidation, createInternship); // POST /api/internships

// Dynamic routes (must be after specific routes to avoid conflicts)
router.get('/:id', getInternshipById); // GET /api/internships/:id
router.put('/:id', authorize('organization'), internshipValidation, updateInternship); // PUT /api/internships/:id
router.patch('/:id/publish', authorize('organization'), publishInternship); // PATCH /api/internships/:id/publish
router.delete('/:id', authorize('organization'), deleteInternship); // DELETE /api/internships/:id

export default router;

/**
 * 🎓 KEY LEARNINGS:
 *
 * 1. ROUTE ORDER MATTERS
 *    - Static routes (like /my-internships) should come before dynamic routes (/:id)
 *    - Otherwise /:id would match "my-internships" and treat it as an ID
 *
 * 2. MIDDLEWARE CHAIN
 *    - Routes can have multiple middlewares: [validation, authentication, controller]
 *    - They execute left to right
 *    - If any middleware calls next(error), the chain stops
 *
 * 3. SEPARATION OF CONCERNS
 *    - Routes: Define endpoints and order middleware
 *    - Middleware: Handle cross-cutting concerns (auth, validation)
 *    - Controllers: Handle business logic
 *    - Models: Handle data layer
 *
 * 4. RESTful CONVENTIONS
 *    - GET /internships - List all
 *    - GET /internships/:id - Get one
 *    - POST /internships - Create
 *    - PUT /internships/:id - Update (full replacement)
 *    - PATCH /internships/:id/action - Partial update or action
 *    - DELETE /internships/:id - Delete
 */
