// backend/src/models/Application.js
import mongoose from 'mongoose';

/**
 * 🎓 LEARNING: Application Schema
 * 
 * Tracks student applications to internships
 * Includes status workflow, custom answers, and AI matching data
 */

const applicationSchema = new mongoose.Schema({
  // ═══════════════════════════════════════════════════════════
  // CORE RELATIONSHIPS
  // ═══════════════════════════════════════════════════════════
  
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true,
    index: true
  },
  
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true,
    index: true
  },
  
  // ═══════════════════════════════════════════════════════════
  // APPLICATION MATERIALS
  // ═══════════════════════════════════════════════════════════
  
  // Resume attachment (optional - student can apply without resume)
  resume: {
    fileName: String,
    fileUrl: String, // ✅ FIX: Made optional - not all applications require resume upload
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },

  // Cover letter text (optional)
  coverLetter: {
    type: String,
    maxlength: [3000, 'Cover letter cannot exceed 3000 characters']
  },

  // ✅ NEW: Cover letter file upload support
  coverLetterFile: {
    fileName: String,
    fileUrl: String,
    mimeType: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },

  portfolio: {
    url: String,
    description: String
  },
  
  // Answers to custom questions from internship listing
  customAnswers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    question: String,
    answer: mongoose.Schema.Types.Mixed, // Can be string, array, or file URL
    answerType: {
      type: String,
      enum: ['text', 'textarea', 'multiple-choice', 'file']
    }
  }],
  
  // ═══════════════════════════════════════════════════════════
  // STATUS & WORKFLOW
  // ═══════════════════════════════════════════════════════════
  
  status: {
    type: String,
    enum: [
      'submitted',      // Initial submission
      'under-review',   // Being reviewed by organization
      'shortlisted',    // Moved to shortlist
      'interview',      // Interview scheduled
      'offered',        // Offer extended
      'accepted',       // Student accepted offer
      'rejected',       // Application rejected
      'withdrawn'       // Student withdrew application
    ],
    default: 'submitted',
    index: true
  },
  
  // Status history for tracking workflow
  statusHistory: [{
    status: {
      type: String,
      enum: [
        'submitted', 'under-review', 'shortlisted', 
        'interview', 'offered', 'accepted', 'rejected', 'withdrawn'
      ]
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  
  // ═══════════════════════════════════════════════════════════
  // AI MATCHING & SCORING
  // ═══════════════════════════════════════════════════════════
  
  aiAnalysis: {
    matchScore: {
      type: Number,
      min: 0,
      max: 100
    },
    skillsMatch: {
      type: Number,
      min: 0,
      max: 100
    },
    educationMatch: {
      type: Number,
      min: 0,
      max: 100
    },
    experienceMatch: {
      type: Number,
      min: 0,
      max: 100
    },
    // AI-generated strengths and weaknesses
    strengths: [String],
    concerns: [String],
    // AI recommendation for recruiter
    recommendation: {
      type: String,
      enum: ['strong-match', 'good-match', 'average-match', 'weak-match']
    },
    // Resume analysis
    resumeAnalysis: {
      keywords: [String],
      missingSkills: [String],
      relevantExperience: Boolean,
      formatQuality: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor']
      }
    },
    lastAnalyzed: Date
  },
  
  // ═══════════════════════════════════════════════════════════
  // INTERVIEW SCHEDULING
  // ═══════════════════════════════════════════════════════════
  
  interviews: [{
    type: {
      type: String,
      enum: ['phone', 'video', 'onsite', 'technical', 'behavioral']
    },
    scheduledAt: Date,
    duration: Number, // in minutes
    location: String,
    meetingLink: String,
    interviewer: {
      name: String,
      title: String,
      email: String
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled']
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      notes: String,
      strengths: [String],
      concerns: [String],
      recommendation: {
        type: String,
        enum: ['hire', 'maybe', 'no-hire']
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // ═══════════════════════════════════════════════════════════
  // COMMUNICATION & NOTES
  // ═══════════════════════════════════════════════════════════
  
  notes: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    private: {
      type: Boolean,
      default: true // Only visible to organization by default
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Messages between student and organization
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // ═══════════════════════════════════════════════════════════
  // REJECTION & FEEDBACK
  // ═══════════════════════════════════════════════════════════
  
  rejection: {
    reason: {
      type: String,
      enum: [
        'position-filled',
        'qualifications',
        'experience-level',
        'skills-mismatch',
        'location',
        'other'
      ]
    },
    feedback: String,
    rejectedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // ═══════════════════════════════════════════════════════════
  // OFFER DETAILS
  // ═══════════════════════════════════════════════════════════
  
  offer: {
    extendedAt: Date,
    expiresAt: Date,
    compensation: {
      amount: Number,
      currency: String,
      period: String
    },
    benefits: [String],
    startDate: Date,
    duration: String,
    conditions: [String],
    accepted: Boolean,
    acceptedAt: Date,
    declinedAt: Date,
    declineReason: String
  },
  
  // ═══════════════════════════════════════════════════════════
  // METADATA & TRACKING
  // ═══════════════════════════════════════════════════════════
  
  // How student found the internship
  source: {
    type: String,
    enum: ['search', 'recommendation', 'featured', 'saved', 'external-link', 'direct'],
    default: 'search'
  },
  
  // Track if student viewed internship before applying
  viewedBefore: {
    type: Boolean,
    default: false
  },
  
  // Time spent on internship page before applying
  timeSpentViewing: Number, // in seconds
  
  // For premium features - priority application
  isPriority: {
    type: Boolean,
    default: false
  },
  
  // Withdrawn application
  withdrawn: {
    at: Date,
    reason: String
  },
  
  // Response times for analytics
  organizationResponseTime: Number, // hours from submission to first status change
  studentResponseTime: Number // hours from offer to acceptance/decline

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ═══════════════════════════════════════════════════════════
// INDEXES
// ═══════════════════════════════════════════════════════════

// Compound indexes for common queries
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ internship: 1, status: 1 });
applicationSchema.index({ student: 1, internship: 1 }, { unique: true }); // One app per internship
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ 'aiAnalysis.matchScore': -1 });
applicationSchema.index({ isPriority: -1, createdAt: -1 });

// ═══════════════════════════════════════════════════════════
// VIRTUALS
// ═══════════════════════════════════════════════════════════

// Check if application is active
applicationSchema.virtual('isActive').get(function() {
  return ['submitted', 'under-review', 'shortlisted', 'interview'].includes(this.status);
});

// Check if offer is pending
applicationSchema.virtual('hasPendingOffer').get(function() {
  return this.status === 'offered' && 
         this.offer && 
         !this.offer.accepted && 
         this.offer.expiresAt > new Date();
});

// Time since submission
applicationSchema.virtual('daysSinceSubmission').get(function() {
  const diff = Date.now() - this.createdAt.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Unread messages count
applicationSchema.virtual('unreadMessagesCount').get(function() {
  return this.messages.filter(m => !m.read).length;
});

// ═══════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════

// Add to status history when status changes
applicationSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    });
  }
  next();
});

// Calculate organization response time on first status change
applicationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'submitted' && !this.organizationResponseTime) {
    const diff = Date.now() - this.createdAt.getTime();
    this.organizationResponseTime = diff / (1000 * 60 * 60); // Convert to hours
  }
  next();
});

// Update internship statistics when application is created
applicationSchema.post('save', async function(doc) {
  if (doc.isNew) {
    const Internship = mongoose.model('Internship');
    await Internship.findByIdAndUpdate(doc.internship, {
      $inc: { 'statistics.applications': 1 }
    });
  }
});

// ═══════════════════════════════════════════════════════════
// INSTANCE METHODS
// ═══════════════════════════════════════════════════════════

// Update status with history
applicationSchema.methods.updateStatus = async function(newStatus, changedBy, notes) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    changedBy,
    notes
  });
  return await this.save();
};

// Add note
applicationSchema.methods.addNote = function(authorId, content, isPrivate = true) {
  this.notes.push({
    author: authorId,
    content,
    private: isPrivate,
    createdAt: new Date()
  });
  return this.save();
};

// Add message
applicationSchema.methods.addMessage = function(senderId, content) {
  this.messages.push({
    sender: senderId,
    content,
    read: false,
    sentAt: new Date()
  });
  return this.save();
};

// Mark messages as read
applicationSchema.methods.markMessagesAsRead = function(userId) {
  this.messages.forEach(message => {
    if (message.sender.toString() !== userId.toString()) {
      message.read = true;
    }
  });
  return this.save();
};

// Schedule interview
applicationSchema.methods.scheduleInterview = function(interviewData) {
  this.interviews.push({
    ...interviewData,
    status: 'scheduled',
    createdAt: new Date()
  });
  this.status = 'interview';
  return this.save();
};

// Reject application
applicationSchema.methods.reject = async function(reason, feedback, rejectedBy) {
  this.status = 'rejected';
  this.rejection = {
    reason,
    feedback,
    rejectedAt: new Date(),
    rejectedBy
  };
  return await this.save();
};

// Extend offer
applicationSchema.methods.extendOffer = async function(offerDetails) {
  this.status = 'offered';
  this.offer = {
    ...offerDetails,
    extendedAt: new Date(),
    expiresAt: offerDetails.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
    accepted: false
  };
  return await this.save();
};

// Accept offer
applicationSchema.methods.acceptOffer = async function() {
  if (this.status !== 'offered') {
    throw new Error('No offer to accept');
  }
  
  this.status = 'accepted';
  this.offer.accepted = true;
  this.offer.acceptedAt = new Date();
  
  // Calculate student response time
  const diff = Date.now() - this.offer.extendedAt.getTime();
  this.studentResponseTime = diff / (1000 * 60 * 60);
  
  return await this.save();
};

// Decline offer
applicationSchema.methods.declineOffer = async function(reason) {
  if (this.status !== 'offered') {
    throw new Error('No offer to decline');
  }
  
  this.status = 'rejected';
  this.offer.accepted = false;
  this.offer.declinedAt = new Date();
  this.offer.declineReason = reason;
  
  return await this.save();
};

// Withdraw application
applicationSchema.methods.withdraw = async function(reason) {
  if (!this.isActive) {
    throw new Error('Cannot withdraw inactive application');
  }
  
  this.status = 'withdrawn';
  this.withdrawn = {
    at: new Date(),
    reason
  };
  
  return await this.save();
};

// ═══════════════════════════════════════════════════════════
// STATIC METHODS
// ═══════════════════════════════════════════════════════════

// Find applications by status
applicationSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('student', 'personalInfo.firstName personalInfo.lastName')
    .populate('internship', 'title organization');
};

// Find student's applications
applicationSchema.statics.findByStudent = function(studentId, status = null) {
  const query = { student: studentId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('internship')
    .populate({
      path: 'internship',
      populate: { path: 'organization', select: 'companyInfo' }
    })
    .sort({ createdAt: -1 });
};

// Find internship's applications
applicationSchema.statics.findByInternship = function(internshipId, status = null) {
  const query = { internship: internshipId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('student')
    .sort({ isPriority: -1, 'aiAnalysis.matchScore': -1, createdAt: -1 });
};

// Get top matches for an internship
applicationSchema.statics.getTopMatches = function(internshipId, limit = 10) {
  return this.find({ 
    internship: internshipId,
    status: { $in: ['submitted', 'under-review'] }
  })
    .sort({ 'aiAnalysis.matchScore': -1 })
    .limit(limit)
    .populate('student');
};

// Get application statistics
applicationSchema.statics.getStatistics = async function(filter = {}) {
  return await this.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgMatchScore: { $avg: '$aiAnalysis.matchScore' }
      }
    }
  ]);
};

// Find applications needing response
applicationSchema.statics.findNeedingResponse = function(daysThreshold = 7) {
  const cutoffDate = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000);
  
  return this.find({
    status: { $in: ['submitted', 'under-review'] },
    createdAt: { $lt: cutoffDate }
  })
    .populate('student internship');
};

// ═══════════════════════════════════════════════════════════
// QUERY HELPERS
// ═══════════════════════════════════════════════════════════

applicationSchema.query.active = function() {
  return this.where({ 
    status: { $in: ['submitted', 'under-review', 'shortlisted', 'interview'] }
  });
};

applicationSchema.query.withHighMatch = function(minScore = 70) {
  return this.where({ 'aiAnalysis.matchScore': { $gte: minScore } });
};

applicationSchema.query.priority = function() {
  return this.where({ isPriority: true });
};

applicationSchema.query.recent = function(days = 7) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.where({ createdAt: { $gte: cutoff } });
};

// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════

export default mongoose.model('Application', applicationSchema);

/**
 * 🎓 USAGE EXAMPLES:
 * 
 * // Create application
 * const application = await Application.create({
 *   student: studentId,
 *   internship: internshipId,
 *   resume: {
 *     fileName: 'resume.pdf',
 *     fileUrl: 'https://...',
 *   },
 *   coverLetter: 'I am excited to apply...',
 *   source: 'recommendation'
 * });
 * 
 * // Update status
 * await application.updateStatus('shortlisted', recruiterId, 'Strong candidate');
 * 
 * // Schedule interview
 * await application.scheduleInterview({
 *   type: 'video',
 *   scheduledAt: new Date('2025-11-15T10:00:00'),
 *   duration: 60,
 *   meetingLink: 'https://zoom.us/...'
 * });
 * 
 * // Extend offer
 * await application.extendOffer({
 *   compensation: { amount: 3000, currency: 'USD', period: 'monthly' },
 *   startDate: new Date('2025-06-01'),
 *   duration: '3 months'
 * });
 * 
 * // Accept offer
 * await application.acceptOffer();
 * 
 * // Get student's applications
 * const apps = await Application.findByStudent(studentId);
 * 
 * // Get top matches
 * const topMatches = await Application.getTopMatches(internshipId, 10);
 */