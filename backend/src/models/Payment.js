// backend/src/models/Payment.js
import mongoose from 'mongoose';

/**
 * 🎓 LEARNING: Payment Model
 * 
 * Purpose: Track all financial transactions in the platform
 * 
 * Why needed?
 * 1. Audit Trail - Legal requirement to track all payments
 * 2. Revenue Analytics - Understand business metrics
 * 3. Customer Support - Resolve billing issues
 * 4. Tax Compliance - Generate invoices and reports
 * 5. Subscription Management - Track recurring payments
 */

const paymentSchema = new mongoose.Schema({
  // ═══════════════════════════════════════════════════════════
  // CORE INFORMATION
  // ═══════════════════════════════════════════════════════════
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // ═══════════════════════════════════════════════════════════
  // PAYMENT AMOUNT
  // ═══════════════════════════════════════════════════════════
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true,
    enum: ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'ZAR', 'INR']
  },
  
  // ═══════════════════════════════════════════════════════════
  // PAYMENT STATUS
  // ═══════════════════════════════════════════════════════════
  
  status: {
    type: String,
    enum: [
      'pending',      // Payment initiated, waiting for confirmation
      'processing',   // Payment being processed by provider
      'completed',    // Payment successful
      'failed',       // Payment failed
      'refunded',     // Payment refunded to customer
      'cancelled'     // Payment cancelled before completion
    ],
    default: 'pending',
    index: true
  },
  
  // ═══════════════════════════════════════════════════════════
  // PAYMENT METHOD
  // ═══════════════════════════════════════════════════════════
  
  paymentMethod: {
    provider: {
      type: String,
      enum: ['stripe', 'paystack', 'paypal', 'flutterwave', 'razorpay'],
      required: true
    },
    type: {
      type: String,
      enum: ['card', 'bank-transfer', 'mobile-money', 'wallet', 'crypto']
    },
    last4: String,              // Last 4 digits of card
    brand: String,              // visa, mastercard, amex, etc.
    bankName: String,           // For bank transfers
    accountNumber: String       // Masked account number
  },
  
  // ═══════════════════════════════════════════════════════════
  // WHAT WAS PURCHASED
  // ═══════════════════════════════════════════════════════════
  
  purchase: {
    type: {
      type: String,
      enum: [
        'subscription',          // Monthly/annual plan upgrade
        'featured-listing',      // Featured internship post
        'resume-credits',        // AI resume builder credits
        'priority-application',  // Priority application feature
        'analytics-access',      // Advanced analytics unlock
        'verification-badge'     // Verification for organizations
      ],
      required: true
    },
    
    // For subscriptions
    plan: {
      type: String,
      enum: ['free', 'premium', 'enterprise']
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'annual', 'one-time']
    },
    
    // For credits/listings
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    
    description: String,
    
    // Additional data
    metadata: mongoose.Schema.Types.Mixed
  },
  
  // ═══════════════════════════════════════════════════════════
  // PAYMENT PROVIDER DATA
  // ═══════════════════════════════════════════════════════════
  
  providerData: {
    customerId: String,           // Stripe customer ID: cus_xxx
    subscriptionId: String,       // Stripe subscription ID: sub_xxx
    invoiceId: String,            // Invoice ID from provider
    chargeId: String,             // Charge ID from provider
    paymentIntentId: String,      // Payment intent ID (Stripe)
    paymentLinkId: String,        // Payment link ID
    webhookData: mongoose.Schema.Types.Mixed  // Raw webhook payload
  },
  
  // ═══════════════════════════════════════════════════════════
  // REFUND INFORMATION
  // ═══════════════════════════════════════════════════════════
  
  refund: {
    refundId: String,
    amount: Number,
    reason: String,
    refundedAt: Date,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  },
  
  // ═══════════════════════════════════════════════════════════
  // RECEIPT & INVOICE
  // ═══════════════════════════════════════════════════════════
  
  receipt: {
    receiptNumber: String,        // INV-202510-ABC123
    receiptUrl: String,           // PDF URL
    invoiceUrl: String,           // Invoice PDF URL
    sentAt: Date,
    emailSentTo: String
  },
  
  // ═══════════════════════════════════════════════════════════
  // TIMESTAMPS
  // ═══════════════════════════════════════════════════════════
  
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  
  // ═══════════════════════════════════════════════════════════
  // FAILURE HANDLING
  // ═══════════════════════════════════════════════════════════
  
  failureReason: String,
  failureCode: String,
  
  retryCount: {
    type: Number,
    default: 0
  },
  nextRetryAt: Date,
  
  // ═══════════════════════════════════════════════════════════
  // CUSTOMER INFORMATION (for invoicing)
  // ═══════════════════════════════════════════════════════════
  
  billingInfo: {
    name: String,
    email: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    taxId: String               // VAT/Tax ID if applicable
  }

}, {
  timestamps: true
});

// ═══════════════════════════════════════════════════════════
// INDEXES
// ═══════════════════════════════════════════════════════════

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ 'purchase.type': 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ 'providerData.customerId': 1 });
paymentSchema.index({ 'providerData.subscriptionId': 1 });
paymentSchema.index({ completedAt: -1 });

// ═══════════════════════════════════════════════════════════
// VIRTUAL PROPERTIES
// ═══════════════════════════════════════════════════════════

paymentSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed';
});

paymentSchema.virtual('isPending').get(function() {
  return ['pending', 'processing'].includes(this.status);
});

paymentSchema.virtual('isFailed').get(function() {
  return this.status === 'failed';
});

paymentSchema.virtual('canRetry').get(function() {
  return this.status === 'failed' && this.retryCount < 3;
});

paymentSchema.virtual('isRefundable').get(function() {
  // Can refund within 30 days of completion
  if (this.status !== 'completed' || this.refund) return false;
  
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.completedAt > thirtyDaysAgo;
});

// ═══════════════════════════════════════════════════════════
// INSTANCE METHODS
// ═══════════════════════════════════════════════════════════

// Mark payment as completed
paymentSchema.methods.markCompleted = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  this.processedAt = this.processedAt || new Date();
  return await this.save();
};

// Mark payment as failed
paymentSchema.methods.markFailed = async function(reason, code) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.failureReason = reason;
  this.failureCode = code;
  return await this.save();
};

// Process refund
paymentSchema.methods.processRefund = async function(refundAmount, reason, processedBy, notes = '') {
  if (!this.isRefundable) {
    throw new Error('Payment is not refundable');
  }
  
  this.status = 'refunded';
  this.refund = {
    amount: refundAmount || this.amount,
    reason,
    refundedAt: new Date(),
    processedBy,
    notes
  };
  return await this.save();
};

// Schedule retry for failed payment
paymentSchema.methods.scheduleRetry = async function(delayHours = 24) {
  if (!this.canRetry) {
    throw new Error('Payment cannot be retried');
  }
  
  this.retryCount += 1;
  this.nextRetryAt = new Date(Date.now() + delayHours * 60 * 60 * 1000);
  this.status = 'pending';
  return await this.save();
};

// Generate receipt number
paymentSchema.methods.generateReceiptNumber = function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  this.receipt.receiptNumber = `INV-${year}${month}-${random}`;
  return this.receipt.receiptNumber;
};

// Update provider data (from webhook)
paymentSchema.methods.updateProviderData = function(data) {
  this.providerData = {
    ...this.providerData,
    ...data
  };
  return this.save();
};

// ═══════════════════════════════════════════════════════════
// STATIC METHODS
// ═══════════════════════════════════════════════════════════

// Find user's payment history
paymentSchema.statics.findByUser = function(userId, status = null) {
  const query = { user: userId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(100);
};

// Find payments by type
paymentSchema.statics.findByPurchaseType = function(type, status = null) {
  const query = { 'purchase.type': type };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 });
};

// Get payment statistics for date range
paymentSchema.statics.getStatistics = async function(startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$purchase.type',
        totalRevenue: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);
};

// Find failed payments needing retry
paymentSchema.statics.findForRetry = function() {
  return this.find({
    status: 'failed',
    retryCount: { $lt: 3 },
    nextRetryAt: { $lte: new Date() }
  });
};

// Get revenue by period (daily, monthly, yearly)
paymentSchema.statics.getRevenueByPeriod = async function(period = 'monthly', year = new Date().getFullYear()) {
  let groupBy;
  
  if (period === 'daily') {
    groupBy = { 
      year: { $year: '$completedAt' },
      month: { $month: '$completedAt' },
      day: { $dayOfMonth: '$completedAt' }
    };
  } else if (period === 'monthly') {
    groupBy = { 
      year: { $year: '$completedAt' },
      month: { $month: '$completedAt' }
    };
  } else {
    groupBy = { year: { $year: '$completedAt' } };
  }
  
  return await this.aggregate([
    { 
      $match: { 
        status: 'completed',
        completedAt: { $exists: true }
      } 
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

// Get total revenue
paymentSchema.statics.getTotalRevenue = async function(filters = {}) {
  const match = { status: 'completed', ...filters };
  
  const result = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  return result[0] || { total: 0, count: 0 };
};

// Get subscription metrics
paymentSchema.statics.getSubscriptionMetrics = async function() {
  return await this.aggregate([
    {
      $match: {
        'purchase.type': 'subscription',
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$purchase.plan',
        count: { $sum: 1 },
        revenue: { $sum: '$amount' },
        monthly: {
          $sum: {
            $cond: [{ $eq: ['$purchase.billingCycle', 'monthly'] }, 1, 0]
          }
        },
        annual: {
          $sum: {
            $cond: [{ $eq: ['$purchase.billingCycle', 'annual'] }, 1, 0]
          }
        }
      }
    }
  ]);
};

// ═══════════════════════════════════════════════════════════
// QUERY HELPERS
// ═══════════════════════════════════════════════════════════

paymentSchema.query.completed = function() {
  return this.where({ status: 'completed' });
};

paymentSchema.query.pending = function() {
  return this.where({ status: { $in: ['pending', 'processing'] } });
};

paymentSchema.query.failed = function() {
  return this.where({ status: 'failed' });
};

paymentSchema.query.subscriptions = function() {
  return this.where({ 'purchase.type': 'subscription' });
};

paymentSchema.query.thisMonth = function() {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return this.where({ createdAt: { $gte: start } });
};

paymentSchema.query.lastNDays = function(days) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.where({ createdAt: { $gte: cutoff } });
};

// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════

export default mongoose.model('Payment', paymentSchema);

/**
 * ═══════════════════════════════════════════════════════════
 * 🎓 USAGE EXAMPLES
 * ═══════════════════════════════════════════════════════════
 * 
 * // 1. Create payment record (when user initiates payment)
 * const payment = await Payment.create({
 *   user: userId,
 *   transactionId: `txn_${Date.now()}_${Math.random().toString(36)}`,
 *   amount: 49.99,
 *   currency: 'USD',
 *   paymentMethod: {
 *     provider: 'stripe',
 *     type: 'card',
 *     last4: '4242',
 *     brand: 'visa'
 *   },
 *   purchase: {
 *     type: 'subscription',
 *     plan: 'premium',
 *     billingCycle: 'monthly',
 *     description: 'Premium Plan - Monthly'
 *   },
 *   billingInfo: {
 *     name: user.name,
 *     email: user.email
 *   }
 * });
 * 
 * // 2. Handle Stripe webhook (payment succeeded)
 * app.post('/webhooks/stripe', async (req, res) => {
 *   const event = req.body;
 *   
 *   if (event.type === 'payment_intent.succeeded') {
 *     const payment = await Payment.findOne({
 *       'providerData.paymentIntentId': event.data.object.id
 *     });
 *     
 *     await payment.markCompleted();
 *     
 *     // Update user's subscription
 *     await User.findByIdAndUpdate(payment.user, {
 *       'subscription.plan': payment.purchase.plan,
 *       'subscription.status': 'active'
 *     });
 *   }
 * });
 * 
 * // 3. Get user's payment history
 * const payments = await Payment.findByUser(userId);
 * // Returns all payments sorted by newest first
 * 
 * // 4. Get only completed payments
 * const completedPayments = await Payment
 *   .findByUser(userId, 'completed');
 * 
 * // 5. Process refund
 * const payment = await Payment.findById(paymentId);
 * await payment.processRefund(
 *   49.99,                    // amount
 *   'Customer request',       // reason
 *   adminUserId,             // who processed it
 *   'Duplicate charge'       // notes
 * );
 * 
 * // 6. Get revenue analytics for dashboard
 * const stats = await Payment.getStatistics(
 *   new Date('2025-01-01'),
 *   new Date('2025-12-31')
 * );
 * // [
 * //   { _id: 'subscription', totalRevenue: 4999.00, count: 100, avgAmount: 49.99 },
 * //   { _id: 'featured-listing', totalRevenue: 999.00, count: 20, avgAmount: 49.95 }
 * // ]
 * 
 * // 7. Get monthly revenue breakdown
 * const monthlyRevenue = await Payment.getRevenueByPeriod('monthly', 2025);
 * // [
 * //   { _id: { year: 2025, month: 1 }, revenue: 1500, count: 30 },
 * //   { _id: { year: 2025, month: 2 }, revenue: 2100, count: 42 }
 * // ]
 * 
 * // 8. Get subscription metrics
 * const subMetrics = await Payment.getSubscriptionMetrics();
 * // [
 * //   { 
 * //     _id: 'premium', 
 * //     count: 150, 
 * //     revenue: 7498.50,
 * //     monthly: 120,
 * //     annual: 30
 * //   }
 * // ]
 * 
 * // 9. Find failed payments to retry
 * const failedPayments = await Payment.findForRetry();
 * for (const payment of failedPayments) {
 *   await payment.scheduleRetry(24); // Retry in 24 hours
 * }
 * 
 * // 10. Check if payment can be refunded
 * if (payment.isRefundable) {
 *   await payment.processRefund(payment.amount, 'Accidental purchase', adminId);
 * }
 * 
 * // 11. Generate receipt after payment
 * payment.generateReceiptNumber();
 * payment.receipt.receiptUrl = 'https://cdn.example.com/receipts/inv-abc.pdf';
 * payment.receipt.sentAt = new Date();
 * payment.receipt.emailSentTo = user.email;
 * await payment.save();
 * 
 * // 12. Get total platform revenue
 * const { total, count } = await Payment.getTotalRevenue();
 * console.log(`Total revenue: ${total} from ${count} payments`);
 * 
 * // 13. Query helpers - find this month's subscriptions
 * const thisMonthSubs = await Payment
 *   .find()
 *   .subscriptions()
 *   .completed()
 *   .thisMonth()
 *   .sort({ createdAt: -1 });
 * 
 * // 14. Get last 30 days revenue
 * const recentRevenue = await Payment
 *   .find()
 *   .completed()
 *   .lastNDays(30);
 * const total30Days = recentRevenue.reduce((sum, p) => sum + p.amount, 0);
 * 
 * // 15. Handle payment failure
 * try {
 *   // Attempt to charge card
 *   const charge = await stripe.charges.create({...});
 * } catch (error) {
 *   await payment.markFailed(
 *     error.message,           // reason
 *     error.code               // error code from Stripe
 *   );
 *   
 *   // Schedule automatic retry if card decline
 *   if (error.code === 'card_declined') {
 *     await payment.scheduleRetry(48); // Try again in 2 days
 *   }
 * }
 */