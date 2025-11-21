// backend/src/routes/matching.routes.js

import express from 'express';
import { getRecommendations, getMatchScore } from '../controllers/matching.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * AI Matching Routes
 * All routes require authentication
 */

router.use(authenticate);

// GET /api/matching/recommendations - Get AI-powered recommendations
router.get('/recommendations', getRecommendations);

// GET /api/matching/score/:internshipId - Get match score for specific internship
router.get('/score/:internshipId', getMatchScore);

export default router;
