// backend/src/routes/premium.routes.js

import express from 'express';
import {
  getResumeOptimizationTips,
  getInterviewPreparationGuide,
  checkPrioritySupportEligibility,
  getPriorityBadge,
  getPremiumFeaturesStatus
} from '../controllers/premium.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * Premium Features Routes
 */

// Get overall premium features status
router.get('/features', getPremiumFeaturesStatus);

// Resume optimization tips (Premium/Pro)
router.get('/resume-tips/:resumeId', getResumeOptimizationTips);

// Interview preparation guide (Premium/Pro)
router.get('/interview-guide/:internshipId', getInterviewPreparationGuide);

// Priority support check
router.get('/priority-support/check', checkPrioritySupportEligibility);

// Priority badge data
router.get('/priority-badge', getPriorityBadge);

export default router;
