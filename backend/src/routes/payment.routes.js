// backend/src/routes/payment.routes.js

/**
 * 🎓 MICROSOFT-GRADE PAYMENT SECURITY
 *
 * Payment processing requires special security considerations:
 * - Stripe webhook signature verification (protects against replay attacks)
 * - Rate limiting on payment endpoints
 * - Raw body parsing for webhooks (signature verification requirement)
 * - Authentication for all user-facing endpoints
 *
 * CRITICAL: Webhook endpoint must NOT use express.json()
 * It needs the raw request body to verify Stripe's signature
 */

import express from 'express';
import {
  createCheckoutSession,
  handleStripeWebhook,
  getSubscriptionStatus,
  createPortalSession,
  cancelSubscription,
  getPlans
} from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { paymentLimiter } from '../middleware/security.middleware.js';

const router = express.Router();

/**
 * Webhook endpoint (NO authentication - verified by Stripe signature)
 *
 * ⚠️  CRITICAL: This route MUST be registered before express.json() in server.js
 * Stripe requires the RAW request body to compute the signature hash.
 *
 * The express.raw() middleware preserves the raw body for signature verification.
 */
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// ✅ FIX: Add JSON body parser for authenticated routes
// The webhook route above uses raw body, but all other routes need JSON parsing
router.use(express.json());

// All other routes require authentication and rate limiting
router.use(authenticate);
router.use(paymentLimiter); // Extra strict rate limiting for payment operations

// Subscription management
router.post('/create-checkout', createCheckoutSession);
router.get('/subscription', getSubscriptionStatus);
router.post('/portal', createPortalSession);
router.post('/cancel', cancelSubscription);
router.get('/plans', getPlans);

export default router;
