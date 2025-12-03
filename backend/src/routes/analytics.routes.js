// backend/src/routes/analytics.routes.js
import express from 'express';
import {
  getOrganizationOverview,
  getInternshipDetail,
  getAnalyticsSummary
} from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * Analytics routes for organizations
 */

// Get organization overview analytics
// Query params: timeRange ('7d' | '30d' | '90d' | '1y')
router.get('/organization', getOrganizationOverview);

// Get quick summary for dashboard
router.get('/summary', getAnalyticsSummary);

// Get analytics for specific internship
router.get('/internship/:id', getInternshipDetail);

export default router;
