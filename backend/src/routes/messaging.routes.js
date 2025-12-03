// backend/src/routes/messaging.routes.js
import express from 'express';
import {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
  deleteConversation,
  getUnreadCount
} from '../controllers/messaging.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * Conversation routes
 */
router.get('/conversations', getConversations);
router.post('/conversations', startConversation);
router.get('/conversations/:id', getMessages);
router.post('/conversations/:id/messages', sendMessage);
router.delete('/conversations/:id', deleteConversation);

/**
 * Utility routes
 */
router.get('/unread-count', getUnreadCount);

export default router;
