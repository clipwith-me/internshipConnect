// backend/src/services/payment.service.js

import Stripe from 'stripe';

// ✅ FIX: Lazy Stripe initialization - create when first needed, not at module load
let stripe = null;
let stripeInitialized = false;

/**
 * Get Stripe client - lazy initialization to ensure env vars are loaded
 */
const getStripe = () => {
  if (!stripeInitialized) {
    stripeInitialized = true;
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

    if (STRIPE_SECRET_KEY) {
      stripe = new Stripe(STRIPE_SECRET_KEY);
      console.log('✅ Stripe initialized successfully');
    } else {
      console.warn('⚠️ Stripe not configured: STRIPE_SECRET_KEY missing from .env');
    }
  }
  return stripe;
};

/**
 * Get webhook secret - lazy loading
 */
const getWebhookSecret = () => {
  return process.env.STRIPE_WEBHOOK_SECRET;
};

// Subscription plans with pricing
export const SUBSCRIPTION_PLANS = {
  student: {
    free: {
      name: 'Free',
      price: 0,
      priceId: null,
      features: {
        aiResumeBuilder: true,
        aiResumeLimit: 3,
        applicationTracking: true,
        basicMatching: true,
        profileCustomization: false,
        prioritySupport: false
      }
    },
    premium: {
      name: 'Premium',
      monthlyPrice: 5.99,
      yearlyPrice: 59,
      stripePriceIdMonthly: process.env.STRIPE_STUDENT_PREMIUM_MONTHLY,
      stripePriceIdYearly: process.env.STRIPE_STUDENT_PREMIUM_YEARLY,
      features: {
        aiResumeBuilder: true,
        aiResumeLimit: 10,
        applicationTracking: true,
        basicMatching: true,
        advancedMatching: true,
        profileCustomization: true,
        prioritySupport: false
      }
    },
    pro: {
      name: 'Pro',
      monthlyPrice: 19.99,
      yearlyPrice: 199,
      stripePriceIdMonthly: process.env.STRIPE_STUDENT_PRO_MONTHLY,
      stripePriceIdYearly: process.env.STRIPE_STUDENT_PRO_YEARLY,
      features: {
        aiResumeBuilder: true,
        aiResumeLimit: -1, // unlimited
        applicationTracking: true,
        basicMatching: true,
        advancedMatching: true,
        profileCustomization: true,
        prioritySupport: true,
        careerCoaching: true
      }
    }
  },
  organization: {
    basic: {
      name: 'Basic',
      price: 0,
      priceId: null,
      features: {
        internshipListings: 3,
        applicantTracking: true,
        basicAnalytics: true,
        featuredListings: 0
      }
    },
    professional: {
      name: 'Professional',
      monthlyPrice: 49,
      yearlyPrice: 490,
      stripePriceIdMonthly: process.env.STRIPE_ORG_PROFESSIONAL_MONTHLY,
      stripePriceIdYearly: process.env.STRIPE_ORG_PROFESSIONAL_YEARLY,
      features: {
        internshipListings: 20,
        applicantTracking: true,
        basicAnalytics: true,
        advancedAnalytics: true,
        featuredListings: 3,
        prioritySupport: false
      }
    },
    enterprise: {
      name: 'Enterprise',
      monthlyPrice: 199,
      yearlyPrice: 1990,
      stripePriceIdMonthly: process.env.STRIPE_ORG_ENTERPRISE_MONTHLY,
      stripePriceIdYearly: process.env.STRIPE_ORG_ENTERPRISE_YEARLY,
      features: {
        internshipListings: -1, // unlimited
        applicantTracking: true,
        basicAnalytics: true,
        advancedAnalytics: true,
        featuredListings: -1, // unlimited
        prioritySupport: true,
        dedicatedAccountManager: true,
        customBranding: true
      }
    }
  }
};

/**
 * Create Stripe checkout session for subscription
 */
export const createCheckoutSession = async ({ userId, userEmail, plan, billingPeriod = 'monthly', role }) => {
  const stripeClient = getStripe();
  if (!stripeClient) {
    throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to .env');
  }

  // Get plan details
  const planDetails = SUBSCRIPTION_PLANS[role][plan];
  if (!planDetails) {
    throw new Error('Invalid plan selected');
  }

  if (plan === 'free' || plan === 'basic') {
    throw new Error('Cannot create checkout for free plan');
  }

  let priceId = billingPeriod === 'monthly'
    ? planDetails.stripePriceIdMonthly
    : planDetails.stripePriceIdYearly;

  // ✅ FIX: If Price ID not configured, provide helpful error message
  if (!priceId) {
    console.warn(`⚠️  Stripe Price ID missing for ${role} ${plan} ${billingPeriod}`);
    console.warn(`   Set STRIPE_${role.toUpperCase()}_${plan.toUpperCase()}_${billingPeriod.toUpperCase()} in .env`);
    console.warn(`   Example: STRIPE_STUDENT_PREMIUM_MONTHLY=price_xxxxxxxxxxxxx`);

    throw new Error(
      `Stripe Price ID not configured for ${plan} ${billingPeriod}. ` +
      `Please create a Price in Stripe Dashboard and add the Price ID to your .env file as: ` +
      `STRIPE_${role.toUpperCase()}_${plan.toUpperCase()}_${billingPeriod.toUpperCase()}=price_xxxxx`
    );
  }

  // Create checkout session
  const session = await stripeClient.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/dashboard/settings?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/dashboard/pricing?payment=cancelled`,
    customer_email: userEmail,
    client_reference_id: userId.toString(),
    metadata: {
      userId: userId.toString(),
      plan,
      billingPeriod,
      role
    },
    subscription_data: {
      metadata: {
        userId: userId.toString(),
        plan,
        role
      }
    }
  });

  return {
    sessionId: session.id,
    url: session.url
  };
};

/**
 * Create customer portal session
 */
export const createPortalSession = async (customerId, returnUrl) => {
  const stripeClient = getStripe();
  if (!stripeClient) {
    throw new Error('Stripe is not configured');
  }

  const session = await stripeClient.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || `${process.env.FRONTEND_URL}/dashboard/settings`,
  });

  return {
    url: session.url
  };
};

/**
 * Handle Stripe webhook events
 */
export const handleWebhookEvent = async (event) => {
  switch (event.type) {
    case 'checkout.session.completed':
      return await handleCheckoutComplete(event.data.object);

    case 'customer.subscription.updated':
      return await handleSubscriptionUpdated(event.data.object);

    case 'customer.subscription.deleted':
      return await handleSubscriptionDeleted(event.data.object);

    case 'invoice.payment_succeeded':
      return await handlePaymentSucceeded(event.data.object);

    case 'invoice.payment_failed':
      return await handlePaymentFailed(event.data.object);

    default:
      console.log(`Unhandled event type: ${event.type}`);
      return { handled: false };
  }
};

/**
 * Handle checkout completion
 */
async function handleCheckoutComplete(session) {
  const { client_reference_id: userId, metadata } = session;

  return {
    userId,
    plan: metadata.plan,
    billingPeriod: metadata.billingPeriod,
    subscriptionId: session.subscription,
    customerId: session.customer,
    status: 'active'
  };
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdated(subscription) {
  const { metadata, customer, status } = subscription;

  return {
    userId: metadata.userId,
    customerId: customer,
    subscriptionId: subscription.id,
    status: status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000)
  };
}

/**
 * Handle subscription deletion/cancellation
 */
async function handleSubscriptionDeleted(subscription) {
  const { metadata, customer } = subscription;

  return {
    userId: metadata.userId,
    customerId: customer,
    subscriptionId: subscription.id,
    status: 'cancelled'
  };
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice) {
  const { customer, subscription, amount_paid } = invoice;

  return {
    customerId: customer,
    subscriptionId: subscription,
    amount: amount_paid / 100, // Convert from cents
    status: 'paid'
  };
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice) {
  const { customer, subscription, amount_due } = invoice;

  return {
    customerId: customer,
    subscriptionId: subscription,
    amount: amount_due / 100,
    status: 'failed'
  };
}

/**
 * Verify webhook signature
 */
export const verifyWebhookSignature = (payload, signature) => {
  const stripeClient = getStripe();
  const webhookSecret = getWebhookSecret();

  if (!stripeClient || !webhookSecret) {
    throw new Error('Stripe webhook secret not configured');
  }

  try {
    const event = stripeClient.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
    return event;
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (subscriptionId) => {
  const stripeClient = getStripe();
  if (!stripeClient) {
    throw new Error('Stripe is not configured');
  }

  const subscription = await stripeClient.subscriptions.cancel(subscriptionId);
  return subscription;
};

/**
 * Get subscription details
 */
export const getSubscription = async (subscriptionId) => {
  const stripeClient = getStripe();
  if (!stripeClient) {
    throw new Error('Stripe is not configured');
  }

  const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
  return subscription;
};

export default {
  createCheckoutSession,
  createPortalSession,
  handleWebhookEvent,
  verifyWebhookSignature,
  cancelSubscription,
  getSubscription,
  SUBSCRIPTION_PLANS
};
