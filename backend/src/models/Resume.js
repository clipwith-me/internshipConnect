// backend/src/models/Resume.js
import mongoose from 'mongoose';

/**
 * 🎓 LEARNING: Resume Model
 * 
 * Purpose: Track AI-generated resume versions separately from StudentProfile
 * 
 * Why separate model?
 * 1. Version History - Keep track of all resume iterations
 * 2. Premium Features - Enforce limits (3 AI resumes/month for free users)
 * 3. Analytics - Track which resumes perform best
 * 4. Performance - Don't load 50+ resume versions with every profile query
 */

const resumeSchema = new mongoose.Schema({
  // ═══════════════════════════════════════════════════════════
  // CORE RELATIONSHIP
  // ═══════════════════════════════════════════════════════════
  
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true,
    index: true
  },
  
  // ═══════════════════════════════════════════════════════════
  // ORIGINAL RESUME
  // ═══════════════════════════════════════════════════════════
  
  original: {
    fileName: String,
    fileUrl: String,
    publicId: String,      // Cloudinary ID for deletion
    fileSize: Number,       // In bytes
    mimeType: String,       // 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // ═══════════════════════════════════════════════════════════
  // AI-GENERATED VERSION
  // ═══════════════════════════════════════════════════════════
  
  aiGenerated: {
    fileName: String,
    fileUrl: String,
    publicId: String,
    generatedAt: {
      type: Date,
      default: Date.now
    },
    
    // What user asked AI to optimize for
    customization: {
      targetRole: String,           // "Software Engineer"
      targetCompany: String,        // "Google" (optional)
      targetIndustry: String,       // "Technology"
      template: {
        type: String,
        enum: ['professional', 'creative', 'modern', 'minimal'],
        default: 'professional'
      },
      emphasis: [String],           // ['technical-skills', 'leadership', 'projects']
      aiModel: String,              // 'gpt-4', 'gpt-3.5-turbo', 'claude-3-opus'
      prompt: String                // The actual prompt sent to AI
    },
    
    // AI's analysis of the generated resume
    analysis: {
      atsScore: {
        type: Number,
        min: 0,
        max: 100
      },
      readabilityScore: {
        type: Number,
        min: 0,
        max: 100
      },
      keywords: [String],           // Extracted keywords
      suggestions: [String],        // Improvement suggestions
      strengths: [String],          // What's good
      improvements: [String]        // What needs work
    }
  },
  
  // ═══════════════════════════════════════════════════════════
  // USAGE ANALYTICS
  // ═══════════════════════════════════════════════════════════
  
  usage: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    applications: {
      type: Number,
      default: 0
    },
    lastUsed: Date
  },
  
  // ═══════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════
  
  version: {
    type: Number,
    default: 1
  },
  
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'active'
  },
  
  tags: [String],
  
  notes: String

}, {
  timestamps: true
});

// ═══════════════════════════════════════════════════════════
// INDEXES
// ═══════════════════════════════════════════════════════════

resumeSchema.index({ student: 1, createdAt: -1 });
resumeSchema.index({ status: 1 });
resumeSchema.index({ 'usage.applications': -1 });

// ═══════════════════════════════════════════════════════════
// VIRTUAL PROPERTIES
// ═══════════════════════════════════════════════════════════

// Check if this is an AI-generated resume
resumeSchema.virtual('isAIGenerated').get(function() {
  return !!this.aiGenerated?.fileUrl;
});

// Get performance score based on usage
resumeSchema.virtual('performanceScore').get(function() {
  const viewWeight = 0.3;
  const downloadWeight = 0.3;
  const applicationWeight = 0.4;
  
  return (
    (this.usage.views * viewWeight) +
    (this.usage.downloads * downloadWeight) +
    (this.usage.applications * applicationWeight)
  );
});

// ═══════════════════════════════════════════════════════════
// INSTANCE METHODS
// ═══════════════════════════════════════════════════════════

// Increment view count
resumeSchema.methods.incrementViews = function() {
  this.usage.views += 1;
  this.usage.lastUsed = new Date();
  return this.save();
};

// Increment download count
resumeSchema.methods.incrementDownloads = function() {
  this.usage.downloads += 1;
  this.usage.lastUsed = new Date();
  return this.save();
};

// Increment application count
resumeSchema.methods.incrementApplications = function() {
  this.usage.applications += 1;
  this.usage.lastUsed = new Date();
  return this.save();
};

// Archive this resume
resumeSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Activate this resume
resumeSchema.methods.activate = function() {
  this.status = 'active';
  return this.save();
};

// ═══════════════════════════════════════════════════════════
// STATIC METHODS
// ═══════════════════════════════════════════════════════════

// Find all resumes for a student
resumeSchema.statics.findByStudent = function(studentId, status = null) {
  const query = { student: studentId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(50);
};

// Get most successful resume for a student
resumeSchema.statics.getMostSuccessful = function(studentId) {
  return this.find({ student: studentId, status: 'active' })
    .sort({ 'usage.applications': -1 })
    .limit(1);
};

// Count resumes created this month (for premium limits)
resumeSchema.statics.getMonthlyUsage = async function(studentId) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  return await this.countDocuments({
    student: studentId,
    createdAt: { $gte: startOfMonth }
  });
};

// Get AI-generated resumes only
resumeSchema.statics.findAIResumes = function(studentId) {
  return this.find({
    student: studentId,
    'aiGenerated.fileUrl': { $exists: true }
  }).sort({ createdAt: -1 });
};

// Get resume analytics for student
resumeSchema.statics.getAnalytics = async function(studentId) {
  const resumes = await this.find({ student: studentId });
  
  return {
    total: resumes.length,
    active: resumes.filter(r => r.status === 'active').length,
    aiGenerated: resumes.filter(r => r.aiGenerated?.fileUrl).length,
    totalViews: resumes.reduce((sum, r) => sum + r.usage.views, 0),
    totalDownloads: resumes.reduce((sum, r) => sum + r.usage.downloads, 0),
    totalApplications: resumes.reduce((sum, r) => sum + r.usage.applications, 0),
    avgATSScore: resumes
      .filter(r => r.aiGenerated?.analysis?.atsScore)
      .reduce((sum, r, _, arr) => sum + r.aiGenerated.analysis.atsScore / arr.length, 0)
  };
};

// ═══════════════════════════════════════════════════════════
// QUERY HELPERS
// ═══════════════════════════════════════════════════════════

resumeSchema.query.active = function() {
  return this.where({ status: 'active' });
};

resumeSchema.query.aiGenerated = function() {
  return this.where({ 'aiGenerated.fileUrl': { $exists: true } });
};

resumeSchema.query.recentlyUsed = function(days = 30) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.where({ 'usage.lastUsed': { $gte: cutoff } });
};

// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════

export default mongoose.model('Resume', resumeSchema);

/**
 * ═══════════════════════════════════════════════════════════
 * 🎓 USAGE EXAMPLES
 * ═══════════════════════════════════════════════════════════
 * 
 * // 1. Create AI-generated resume
 * const resume = await Resume.create({
 *   student: studentProfileId,
 *   aiGenerated: {
 *     fileName: 'john_doe_software_engineer.pdf',
 *     fileUrl: 'https://cloudinary.com/resumes/abc123.pdf',
 *     publicId: 'resumes/abc123',
 *     customization: {
 *       targetRole: 'Software Engineer',
 *       targetCompany: 'Google',
 *       template: 'modern',
 *       emphasis: ['technical-skills', 'projects'],
 *       aiModel: 'gpt-4'
 *     },
 *     analysis: {
 *       atsScore: 92,
 *       readabilityScore: 78,
 *       keywords: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
 *       strengths: ['Strong project portfolio', 'Clear technical skills'],
 *       suggestions: ['Add LinkedIn URL', 'Quantify achievements']
 *     }
 *   }
 * });
 * 
 * // 2. Check monthly limit before generating
 * const monthlyCount = await Resume.getMonthlyUsage(studentId);
 * if (user.subscription.plan === 'free' && monthlyCount >= 3) {
 *   throw new Error('Free plan allows 3 AI resumes per month');
 * }
 * 
 * // 3. Track when employer views resume
 * const resume = await Resume.findById(resumeId);
 * await resume.incrementViews();
 * 
 * // 4. Get student's best-performing resume
 * const [bestResume] = await Resume.getMostSuccessful(studentId);
 * console.log(`Best resume: ${bestResume.usage.applications} applications`);
 * 
 * // 5. Get all analytics for dashboard
 * const analytics = await Resume.getAnalytics(studentId);
 * // {
 * //   total: 8,
 * //   active: 5,
 * //   aiGenerated: 6,
 * //   totalViews: 234,
 * //   totalDownloads: 45,
 * //   totalApplications: 18,
 * //   avgATSScore: 87.5
 * // }
 * 
 * // 6. Find resumes with query helpers
 * const activeAIResumes = await Resume
 *   .find({ student: studentId })
 *   .active()
 *   .aiGenerated()
 *   .recentlyUsed(30)
 *   .sort({ 'usage.applications': -1 });
 */