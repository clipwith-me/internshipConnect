// backend/src/routes/application.routes.js
import express from 'express';
import { body } from 'express-validator';
import {
  submitApplication,
  getMyApplications,
  getInternshipApplications,
  updateApplicationStatus,
  withdrawApplication,
  getOrganizationApplications
} from '../controllers/application.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { uploadCoverLetter, handleUploadError } from '../middleware/upload.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * ✅ Updated validation for applications
 * - internshipId validation handled in controller for better error messages
 * - coverLetter is now optional (can upload file instead)
 * - Supports both JSON and multipart/form-data
 */
const applicationValidation = [
  body('internshipId')
    .notEmpty()
    .withMessage('Internship ID is required')
    .isMongoId()
    .withMessage('Invalid internship ID'),

  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Cover letter cannot exceed 3000 characters'),

  validate
];

const statusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['submitted', 'under-review', 'shortlisted', 'interview', 'offered', 'accepted', 'rejected', 'withdrawn'])
    .withMessage('Invalid status'),

  validate
];

// ✅ SECURITY FIX: Student-only routes (submit, view own, withdraw applications)
// ✅ Added file upload support with multer middleware
router.post('/',
  authorize('student'),
  uploadCoverLetter,  // Handle file upload first
  handleUploadError,  // Handle multer errors
  applicationValidation,
  submitApplication
);
router.get('/', authorize('student'), getMyApplications);
router.delete('/:id', authorize('student'), withdrawApplication);

// ✅ SECURITY FIX: Organization-only routes (view applications for their internships, update status)
router.get('/organization', authorize('organization'), getOrganizationApplications); // OPTIMIZED: Single query for all org applications
router.get('/internship/:id', authorize('organization'), getInternshipApplications);
router.patch('/:id/status', authorize('organization'), statusValidation, updateApplicationStatus);

export default router;
