import mongoose from 'mongoose';

/**
 * AnalyticsEvent — tracks every meaningful user action on the platform.
 * Used by the founder dashboard for funnel analysis, cohort analysis,
 * engagement scoring, and AI-generated insights.
 */
const analyticsEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: [
      'signup', 'login', 'logout',
      'profile_view', 'profile_completed',
      'internship_view', 'internship_search',
      'application_submitted', 'application_withdrawn',
      'resume_upload', 'resume_view',
      'message_sent', 'notification_read',
      'skill_added', 'certification_added',
      'internship_posted', 'internship_closed',
      'offer_sent', 'offer_accepted', 'offer_rejected',
      'interview_scheduled', 'interview_completed',
      'referral_sent', 'referral_converted',
      'subscription_started', 'subscription_cancelled',
      'payment_completed',
    ],
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  userRole: {
    type: String,
    enum: ['student', 'organization', 'admin'],
    index: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  // Geographic context
  country: { type: String, index: true },
  state: String,
  city: String,
  // Session context
  sessionId: String,
  platform: { type: String, enum: ['web', 'mobile', 'api'], default: 'web' },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: false,
  versionKey: false,
});

// Compound indexes for common query patterns
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ userId: 1, eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ userRole: 1, timestamp: -1 });
analyticsEventSchema.index({ country: 1, eventType: 1 });

// TTL index — auto-delete raw events after 2 years (keep aggregates)
analyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });

export default mongoose.model('AnalyticsEvent', analyticsEventSchema);
