// backend/src/models/Notification.js
import mongoose from 'mongoose';

/**
 * Notification Schema
 * Handles all user notifications across the platform
 */

const notificationSchema = new mongoose.Schema({
  // User who receives the notification
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Notification type for categorization and icons
  type: {
    type: String,
    enum: [
      'application_submitted',      // Student submitted application
      'application_reviewed',       // Org reviewed application
      'application_shortlisted',    // Student shortlisted
      'interview_scheduled',        // Interview scheduled
      'offer_extended',            // Offer made
      'offer_accepted',            // Student accepted
      'offer_declined',            // Student declined
      'application_rejected',      // Application rejected
      'application_withdrawn',     // Student withdrew
      'new_internship',            // New internship matching preferences
      'internship_expiring',       // Deadline approaching
      'profile_incomplete',        // Reminder to complete profile
      'message_received',          // New message
      'system'                     // System notifications
    ],
    required: true,
    index: true
  },

  // Notification content
  title: {
    type: String,
    required: true,
    maxlength: 200
  },

  message: {
    type: String,
    required: true,
    maxlength: 500
  },

  // Read status
  read: {
    type: Boolean,
    default: false,
    index: true
  },

  // Action URL for click navigation
  actionUrl: {
    type: String
  },

  // Related entities for context
  relatedApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },

  relatedInternship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship'
  },

  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },

  // Email notification sent
  emailSent: {
    type: Boolean,
    default: false
  },

  // Expiry date (auto-delete old notifications)
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    // Note: TTL index is defined separately below
  }

}, {
  timestamps: true
});

// Compound indexes for efficient queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Static methods
notificationSchema.statics.createNotification = async function(data) {
  return await this.create(data);
};

notificationSchema.statics.getUserNotifications = async function(userId, { limit = 20, skip = 0, unreadOnly = false } = {}) {
  const query = { user: userId };
  if (unreadOnly) query.read = false;

  return await this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ user: userId, read: false });
};

notificationSchema.statics.markAsRead = async function(notificationId, userId) {
  return await this.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { read: true },
    { new: true }
  );
};

notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { user: userId, read: false },
    { read: true }
  );
};

// Helper to create application-related notifications
notificationSchema.statics.notifyApplicationUpdate = async function(application, type, recipientId) {
  const titles = {
    'application_submitted': 'New Application Received',
    'application_reviewed': 'Application Under Review',
    'application_shortlisted': 'You\'ve Been Shortlisted!',
    'interview_scheduled': 'Interview Scheduled',
    'offer_extended': 'Offer Extended!',
    'offer_accepted': 'Offer Accepted',
    'offer_declined': 'Offer Declined',
    'application_rejected': 'Application Update',
    'application_withdrawn': 'Application Withdrawn'
  };

  const messages = {
    'application_submitted': `New application for ${application.internship?.title || 'your internship'}`,
    'application_reviewed': `Your application for ${application.internship?.title || 'the internship'} is being reviewed`,
    'application_shortlisted': `Congratulations! You've been shortlisted for ${application.internship?.title || 'the internship'}`,
    'interview_scheduled': `Interview scheduled for ${application.internship?.title || 'the internship'}`,
    'offer_extended': `You've received an offer for ${application.internship?.title || 'the internship'}!`,
    'offer_accepted': `The candidate accepted the offer for ${application.internship?.title || 'the position'}`,
    'offer_declined': `The candidate declined the offer for ${application.internship?.title || 'the position'}`,
    'application_rejected': `Your application for ${application.internship?.title || 'the internship'} was not selected`,
    'application_withdrawn': `Application withdrawn for ${application.internship?.title || 'the internship'}`
  };

  return await this.create({
    user: recipientId,
    type,
    title: titles[type] || 'Application Update',
    message: messages[type] || 'Your application has been updated',
    actionUrl: `/dashboard/applications`,
    relatedApplication: application._id,
    relatedInternship: application.internship?._id || application.internship
  });
};

export default mongoose.model('Notification', notificationSchema);