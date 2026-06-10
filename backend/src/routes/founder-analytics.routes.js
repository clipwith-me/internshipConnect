import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  getExecutiveOverview,
  getUserGrowth,
  getMarketplaceAnalytics,
  getPlacementFunnel,
  getGeographicAnalytics,
  getRevenueAnalytics,
  getAIInsights,
  getRealTimeActivity,
  getInvestorMetrics,
} from '../controllers/founder-analytics.controller.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/overview',     getExecutiveOverview);
router.get('/user-growth',  getUserGrowth);
router.get('/marketplace',  getMarketplaceAnalytics);
router.get('/funnel',       getPlacementFunnel);
router.get('/geographic',   getGeographicAnalytics);
router.get('/revenue',      getRevenueAnalytics);
router.get('/insights',     getAIInsights);
router.get('/realtime',     getRealTimeActivity);
router.get('/investor',     getInvestorMetrics);

export default router;
