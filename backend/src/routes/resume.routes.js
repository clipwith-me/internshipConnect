// backend/src/routes/resume.routes.js
import express from 'express';
import { body } from 'express-validator';
import {
  generateAIResume,
  getMyResumes,
  getResumeById,
  deleteResume,
  downloadResume,
  viewApplicantProfile
} from '../controllers/resume.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

const generateValidation = [
  body('customization')
    .optional()
    .isIn(['professional', 'creative', 'modern', 'minimal'])
    .withMessage('Invalid customization style'),

  validate
];

router.post('/generate', generateValidation, generateAIResume);
router.get('/', getMyResumes);
router.get('/applicant/:applicationId', viewApplicantProfile); // Organization viewing applicant
router.get('/:id/download', downloadResume); // ✅ NEW: Download PDF endpoint
router.get('/:id', getResumeById);
router.delete('/:id', deleteResume);

export default router;
