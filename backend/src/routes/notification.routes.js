// backend/src/routes/notification.routes.js
import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createTestNotification,
  testApplicationFlow
} from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark all as read
router.patch('/read-all', markAllAsRead);

// Mark single notification as read
router.patch('/:id/read', markAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Test notification (dev only)
router.post('/test', createTestNotification);

// Test application notification flow (dev only)
router.post('/test-application-flow', testApplicationFlow);

export default router;