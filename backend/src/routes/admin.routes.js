// backend/src/routes/admin.routes.js

import express from 'express';
import {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  deleteUser,
  getAnalytics,
  getRecentActivity
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard & Statistics
router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/activity', getRecentActivity);

// User Management
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

export default router;
