// backend/src/models/Conversation.js
import mongoose from 'mongoose';

/**
 * Conversation Model for Direct Messaging (Pro Feature)
 * Manages conversations between students and organizations
 */

const conversationSchema = new mongoose.Schema(
  {
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      userType: {
        type: String,
        enum: ['student', 'organization'],
        required: true
      },
      lastReadAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Related internship (optional - conversation can be about specific internship)
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship'
    },
    lastMessage: {
      content: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      sentAt: Date
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {}
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'blocked'],
      default: 'active'
    },
    // Metadata
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tags: [String], // For filtering/organization
    isPro: {
      type: Boolean,
      default: false // Track if this is a Pro feature conversation
    }
  },
  {
    timestamps: true
  }
);

// Indexes
conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ status: 1, updatedAt: -1 });
conversationSchema.index({ internship: 1 });

// Virtual for checking if user is participant
conversationSchema.methods.hasParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString());
};

// Get unread count for specific user
conversationSchema.methods.getUnreadCount = function(userId) {
  return this.unreadCount.get(userId.toString()) || 0;
};

// Increment unread count for user
conversationSchema.methods.incrementUnreadCount = function(userId) {
  const count = this.getUnreadCount(userId);
  this.unreadCount.set(userId.toString(), count + 1);
  return this.save();
};

// Reset unread count for user
conversationSchema.methods.resetUnreadCount = function(userId) {
  this.unreadCount.set(userId.toString(), 0);
  // Update lastReadAt for participant
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.lastReadAt = new Date();
  }
  return this.save();
};

// Update last message
conversationSchema.methods.updateLastMessage = function(message) {
  this.lastMessage = {
    content: message.content,
    sender: message.sender,
    sentAt: message.createdAt
  };
  this.updatedAt = new Date();
  return this.save();
};

export default mongoose.model('Conversation', conversationSchema);
