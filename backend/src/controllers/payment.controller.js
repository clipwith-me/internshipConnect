// backend/src/controllers/payment.controller.js

import {
  createCheckoutSession as createStripeCheckout,
  createPortalSession as createStripePortal,
  handleWebhookEvent,
  verifyWebhookSignature,
  cancelSubscription as cancelStripeSubscription,
  getSubscription as getStripeSubscription,
  SUBSCRIPTION_PLANS
} from '../services/payment.service.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import envConfig from '../config/env.config.js';

/**
 * @desc    Create Stripe checkout session
 * @route   POST /api/payments/create-checkout
 * @access  Private
 */
export const createCheckoutSession = async (req, res) => {
  try {
    // ✅ FIX: Check if Stripe is configured
    if (!envConfig.isServiceConfigured('stripe')) {
      console.warn('⚠️  Stripe not configured - payment request blocked');
      return res.status(503).json({
        success: false,
        error: 'Payment processing is temporarily unavailable. Please try again later or contact support.',
        message: 'Stripe payment provider not configured'
      });
    }

    const { plan, billingPeriod = 'monthly' } = req.body;
    const userId = req.user._id;
    const userEmail = req.user.email;
    const role = req.user.role;

    // Validate plan exists
    if (!SUBSCRIPTION_PLANS[role] || !SUBSCRIPTION_PLANS[role][plan]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription plan for your account type'
      });
    }

    // Check if user already has active subscription
    if (req.user.subscription?.status === 'active' && req.user.subscription?.plan !== 'free' && req.user.subscription?.plan !== 'basic') {
      return res.status(400).json({
        success: false,
        error: 'You already have an active subscription. Please cancel it first or use the billing portal to change plans.'
      });
    }

    // Create Stripe checkout session
    const session = await createStripeCheckout({
      userId,
      userEmail,
      plan,
      billingPeriod,
      role
    });

    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create checkout session'
    });
  }
};

/**
 * @desc    Handle Stripe webhook events
 * @route   POST /api/payments/webhook
 * @access  Public (verified by Stripe signature)
 */
export const handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  try {
    // Verify webhook signature
    const event = verifyWebhookSignature(req.body, signature);

    console.log(`📨 Webhook received: ${event.type}`);

    // Handle the event
    const result = await handleWebhookEvent(event);

    if (result.handled === false) {
      return res.json({ received: true, handled: false });
    }

    // Update user subscription based on event
    if (result.userId) {
      const user = await User.findById(result.userId);

      if (user) {
        // Update subscription status
        user.subscription = {
          plan: result.plan || user.subscription?.plan || 'free',
          status: result.status,
          stripeCustomerId: result.customerId || user.subscription?.stripeCustomerId,
          stripeSubscriptionId: result.subscriptionId || user.subscription?.stripeSubscriptionId,
          currentPeriodEnd: result.currentPeriodEnd || user.subscription?.currentPeriodEnd,
          features: SUBSCRIPTION_PLANS[user.role][result.plan || 'free']?.features || {}
        };

        await user.save();
        console.log(`✅ Updated user ${result.userId} subscription to ${result.status}`);

        // Record payment if applicable
        if (result.amount && result.status === 'paid') {
          await Payment.create({
            user: result.userId,
            amount: result.amount,
            currency: 'usd',
            status: 'completed',
            transactionId: result.subscriptionId,
            paymentMethod: 'stripe',
            metadata: {
              customerId: result.customerId,
              subscriptionId: result.subscriptionId
            }
          });
          console.log(`💰 Recorded payment of $${result.amount} for user ${result.userId}`);
        }
      }
    }

    res.json({ received: true, handled: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get current subscription status
 * @route   GET /api/payments/subscription
 * @access  Private
 */
export const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('subscription role');

    if (!user.subscription || !user.subscription.stripeSubscriptionId) {
      return res.json({
        success: true,
        data: {
          plan: user.role === 'student' ? 'free' : 'basic',
          status: 'inactive',
          features: SUBSCRIPTION_PLANS[user.role][user.role === 'student' ? 'free' : 'basic'].features
        }
      });
    }

    // Get live subscription data from Stripe
    try {
      const subscription = await getStripeSubscription(user.subscription.stripeSubscriptionId);

      res.json({
        success: true,
        data: {
          plan: user.subscription.plan,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          features: user.subscription.features
        }
      });
    } catch (stripeError) {
      // If Stripe API fails, return cached data
      res.json({
        success: true,
        data: {
          plan: user.subscription.plan,
          status: user.subscription.status,
          currentPeriodEnd: user.subscription.currentPeriodEnd,
          features: user.subscription.features
        }
      });
    }
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription status'
    });
  }
};

/**
 * @desc    Create Stripe customer portal session
 * @route   POST /api/payments/portal
 * @access  Private
 */
export const createPortalSession = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.subscription?.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    const returnUrl = `${process.env.FRONTEND_URL}/dashboard/settings`;
    const session = await createStripePortal(user.subscription.stripeCustomerId, returnUrl);

    res.json({
      success: true,
      data: {
        url: session.url
      }
    });
  } catch (error) {
    console.error('Create portal session error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create portal session'
    });
  }
};

/**
 * @desc    Cancel subscription
 * @route   POST /api/payments/cancel
 * @access  Private
 */
export const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.subscription?.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    // Cancel subscription at period end (not immediately)
    const subscription = await cancelStripeSubscription(user.subscription.stripeSubscriptionId);

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
      data: {
        cancelAt: new Date(subscription.cancel_at * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel subscription'
    });
  }
};

/**
 * @desc    Get available subscription plans
 * @route   GET /api/payments/plans
 * @access  Private
 */
export const getPlans = async (req, res) => {
  try {
    const role = req.user.role;
    const plans = SUBSCRIPTION_PLANS[role];

    if (!plans) {
      return res.status(400).json({
        success: false,
        error: 'No plans available for your account type'
      });
    }

    // Format plans for frontend
    const formattedPlans = Object.entries(plans).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice || plan.price || 0,
      yearlyPrice: plan.yearlyPrice || plan.price || 0,
      features: plan.features
    }));

    res.json({
      success: true,
      data: formattedPlans
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription plans'
    });
  }
};

export default {
  createCheckoutSession,
  handleStripeWebhook,
  getSubscriptionStatus,
  createPortalSession,
  cancelSubscription,
  getPlans
};
