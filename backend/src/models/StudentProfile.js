// backend/src/models/StudentProfile.js
import mongoose from 'mongoose';

/**
 * 🎓 LEARNING: StudentProfile Schema
 * 
 * Separate from User for:
 * 1. Security - Auth data separate from profile data
 * 2. Performance - Only load profiles when needed
 * 3. Flexibility - Easy to add student-specific fields
 * 
 * Uses EMBEDDED documents for related data (education, skills)
 * Uses REFERENCED documents for relationships (user, applications)
 */

const studentProfileSchema = new mongoose.Schema({
  // ═══════════════════════════════════════════════════════════
  // CORE FIELDS
  // ═══════════════════════════════════════════════════════════
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true  // One profile per user
  },
  
  // ═══════════════════════════════════════════════════════════
  // PERSONAL INFORMATION (Embedded Subdocument)
  // ═══════════════════════════════════════════════════════════
  
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    phone: {
      type: String,
      match: [/^\+?[\d\s\-()]+$/, 'Please provide a valid phone number']
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'prefer-not-to-say']
    },
    nationality: String,
   location: {
  address: String,
  city: String,
  state: String,
  country: String,
  zipCode: String
  // Removed coordinates completely for now
},
    profilePicture: {
      url: String,
      publicId: String  // For Cloudinary deletion
    }
  },
  
  // ═══════════════════════════════════════════════════════════
  // EDUCATION (Array of Embedded Documents)
  // ═══════════════════════════════════════════════════════════
  
  education: [{
    institution: {
      type: String,
      required: true,
      trim: true
    },
    degree: {
      type: String,
      required: true,
      enum: ['high-school', 'associate', 'bachelor', 'master', 'phd', 'bootcamp', 'certificate']
    },
    major: String,
    minor: String,
    graduationYear: {
      type: Number,
      min: 1950,
      max: 2050
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4.0
    },
    current: {
      type: Boolean,
      default: false
    },
    achievements: [String],
    relevantCourses: [String],
    startDate: Date,
    endDate: Date
  }],
  
  // ═══════════════════════════════════════════════════════════
  // SKILLS (Array with AI Embeddings)
  // 🎓 Embeddings are vector representations for semantic search
  // ═══════════════════════════════════════════════════════════
  
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['technical', 'soft', 'language', 'tool', 'framework', 'other']
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    yearsOfExperience: Number,
    // 🎓 AI Vector Embedding for semantic matching
    embedding: {
      type: [Number],
      select: false  // Don't return by default (large array)
    },
    endorsements: {
      type: Number,
      default: 0
    }
  }],
  
  // ═══════════════════════════════════════════════════════════
  // WORK EXPERIENCE
  // ═══════════════════════════════════════════════════════════
  
  experience: [{
    title: {
      type: String,
      required: true
    },
    company: {
      type: String,
      required: true
    },
    location: {
      city: String,
      country: String,
      remote: {
        type: Boolean,
        default: false
      }
    },
    employmentType: {
      type: String,
      enum: ['internship', 'part-time', 'full-time', 'freelance', 'contract']
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    current: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      maxlength: 2000
    },
    achievements: [String],
    skills: [String],
    // 🎓 Reference to actual internship if it was through platform
    internshipRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship'
    }
  }],
  
  // ═══════════════════════════════════════════════════════════
  // PROJECTS
  // ═══════════════════════════════════════════════════════════
  
  projects: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000
    },
    role: String,
    url: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL']
    },
    githubUrl: String,
    technologies: [String],
    highlights: [String],
    startDate: Date,
    endDate: Date,
    featured: {
      type: Boolean,
      default: false
    }
  }],
  
  // ═══════════════════════════════════════════════════════════
  // CERTIFICATIONS
  // ═══════════════════════════════════════════════════════════
  
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuer: {
      type: String,
      required: true
    },
    issueDate: Date,
    expiryDate: Date,
    credentialId: String,
    credentialUrl: String,
    skills: [String]
  }],
  
  // ═══════════════════════════════════════════════════════════
  // RESUME MANAGEMENT
  // ═══════════════════════════════════════════════════════════
  
  resume: {
    original: {
      fileName: String,
      fileUrl: String,
      fileSize: Number,
      uploadedAt: Date,
      publicId: String  // Cloudinary reference
    },
    // 🎓 AI-Generated Resume Versions
    aiVersions: [{
      versionId: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString()
      },
      fileName: String,
      fileUrl: String,
      generatedAt: {
        type: Date,
        default: Date.now
      },
      customization: {
        targetRole: String,
        targetCompany: String,
        targetIndustry: String,
        emphasis: [String],  // e.g., ['technical', 'leadership']
        template: String,
        aiModel: String  // 'gpt-4', 'claude-3', etc.
      },
      downloadCount: {
        type: Number,
        default: 0
      }
    }],
    // Parsed resume data for AI matching
    parsedData: {
      extractedSkills: [String],
      extractedExperience: mongoose.Schema.Types.Mixed,
      summary: String,
      lastParsed: Date
    }
  },
  
  // ═══════════════════════════════════════════════════════════
  // PREFERENCES & INTERESTS
  // ═══════════════════════════════════════════════════════════
  
  preferences: {
    internshipTypes: [{
      type: String,
      enum: ['remote', 'onsite', 'hybrid']
    }],
    industries: [String],
    roles: [String],
    locations: [{
      city: String,
      country: String,
      willingToRelocate: Boolean
    }],
    compensation: {
      minStipend: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      negotiable: {
        type: Boolean,
        default: true
      }
    },
    availability: {
      startDate: Date,
      endDate: Date,
      preferredDuration: String,  // e.g., '3-6 months'
      hoursPerWeek: Number
    },
    workAuthorization: {
      countries: [String],
      requiresSponsorship: Boolean
    }
  },
  
  // ═══════════════════════════════════════════════════════════
  // BIO & SOCIAL
  // ═══════════════════════════════════════════════════════════
  
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  
  headline: {
    type: String,
    maxlength: [120, 'Headline cannot exceed 120 characters']
  },
  
  socialLinks: {
    linkedin: {
      type: String,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/.+/, 'Invalid LinkedIn URL']
    },
    github: {
      type: String,
      match: [/^https?:\/\/(www\.)?github\.com\/.+/, 'Invalid GitHub URL']
    },
    portfolio: String,
    twitter: String,
    medium: String,
    stackoverflow: String
  },
  
  // ═══════════════════════════════════════════════════════════
  // LANGUAGES
  // ═══════════════════════════════════════════════════════════
  
  languages: [{
    name: {
      type: String,
      required: true
    },
    proficiency: {
      type: String,
      enum: ['elementary', 'limited-working', 'professional', 'native'],
      required: true
    }
  }],
  
  // ═══════════════════════════════════════════════════════════
  // ACHIEVEMENTS & AWARDS
  // ═══════════════════════════════════════════════════════════
  
  achievements: [{
    title: String,
    description: String,
    date: Date,
    issuer: String
  }],
  
  // ═══════════════════════════════════════════════════════════
  // ANALYTICS & METRICS
  // ═══════════════════════════════════════════════════════════
  
  analytics: {
    profileViews: {
      type: Number,
      default: 0
    },
    profileViewsThisMonth: {
      type: Number,
      default: 0
    },
    searchAppearances: {
      type: Number,
      default: 0
    },
    lastViewedBy: [{
      organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationProfile'
      },
      viewedAt: Date
    }]
  },
  
  // ═══════════════════════════════════════════════════════════
  // PROFILE STATUS
  // ═══════════════════════════════════════════════════════════
  
  profileCompleteness: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'hidden'],
    default: 'active'
  },
  
  visibility: {
    type: String,
    enum: ['public', 'private', 'connections-only'],
    default: 'public'
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ═══════════════════════════════════════════════════════════
// INDEXES
// ═══════════════════════════════════════════════════════════

// ✅ PERFORMANCE: Critical indexes for fast queries
// Note: 'user' already has unique:true which creates an index
// createdAt has an index from earlier (line 451), so we don't duplicate it
// Only add indexes that don't have unique:true or index:true in schema
studentProfileSchema.index({ 'skills.name': 1 });
studentProfileSchema.index({ 'education.graduationYear': 1 });
studentProfileSchema.index({ 'education.institution': 1 });
studentProfileSchema.index({ profileCompleteness: -1 });
studentProfileSchema.index({ status: 1 });

// ═══════════════════════════════════════════════════════════
// VIRTUALS
// ═══════════════════════════════════════════════════════════

// Full name virtual
studentProfileSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Age calculation
studentProfileSchema.virtual('age').get(function() {
  if (!this.personalInfo.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for applications
studentProfileSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'student'
});

// Virtual for saved internships
studentProfileSchema.virtual('savedInternships', {
  ref: 'SavedInternship',
  localField: '_id',
  foreignField: 'student'
});

// Years of experience calculation
studentProfileSchema.virtual('totalExperience').get(function() {
  if (!this.experience || this.experience.length === 0) return 0;
  
  let totalMonths = 0;
  this.experience.forEach(exp => {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : new Date(exp.endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth());
    totalMonths += months;
  });
  
  return Math.round(totalMonths / 12 * 10) / 10; // Years with 1 decimal
});

// ═══════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════

// Calculate profile completeness before saving
studentProfileSchema.pre('save', function(next) {
  this.profileCompleteness = this.calculateCompleteness();
  next();
});

// Reset monthly views on first day of month
studentProfileSchema.pre('save', function(next) {
  const now = new Date();
  if (now.getDate() === 1 && this.isModified('analytics.profileViews')) {
    this.analytics.profileViewsThisMonth = 0;
  }
  next();
});

// ═══════════════════════════════════════════════════════════
// INSTANCE METHODS
// ═══════════════════════════════════════════════════════════

// Calculate profile completeness score
studentProfileSchema.methods.calculateCompleteness = function() {
  let score = 0;
  const weights = {
    personalInfo: 15,
    education: 20,
    skills: 15,
    experience: 15,
    projects: 10,
    resume: 20,
    bio: 5
  };
  
  // Personal Info
  if (this.personalInfo?.firstName && 
      this.personalInfo?.lastName && 
      this.personalInfo?.phone &&
      this.personalInfo?.location?.city) {
    score += weights.personalInfo;
  }
  
  // Education
  if (this.education?.length > 0) {
    score += weights.education;
  }
  
  // Skills (at least 3)
  if (this.skills?.length >= 3) {
    score += weights.skills;
  }
  
  // Experience
  if (this.experience?.length > 0) {
    score += weights.experience;
  }
  
  // Projects (at least 1)
  if (this.projects?.length > 0) {
    score += weights.projects;
  }
  
  // Resume
  if (this.resume?.original?.fileUrl) {
    score += weights.resume;
  }
  
  // Bio
  if (this.bio && this.bio.length >= 50) {
    score += weights.bio;
  }
  
  return score;
};

// Increment profile view
studentProfileSchema.methods.incrementView = async function(viewedBy = null) {
  this.analytics.profileViews += 1;
  this.analytics.profileViewsThisMonth += 1;
  
  if (viewedBy) {
    this.analytics.lastViewedBy.unshift({
      organization: viewedBy,
      viewedAt: new Date()
    });
    
    // Keep only last 50 views
    if (this.analytics.lastViewedBy.length > 50) {
      this.analytics.lastViewedBy = this.analytics.lastViewedBy.slice(0, 50);
    }
  }
  
  return await this.save();
};

// Add AI resume version
studentProfileSchema.methods.addAIResume = function(customization, fileUrl, fileName) {
  this.resume.aiVersions.push({
    fileName,
    fileUrl,
    generatedAt: new Date(),
    customization,
    downloadCount: 0
  });
  
  return this.save();
};

// Get skills by category
studentProfileSchema.methods.getSkillsByCategory = function(category) {
  return this.skills.filter(skill => skill.category === category);
};

// Check if student matches internship requirements
studentProfileSchema.methods.matchesInternship = function(internship) {
  const matchScore = {
    skills: 0,
    education: 0,
    experience: 0,
    location: 0,
    overall: 0
  };
  
  // Skills matching
  if (internship.requirements?.skills) {
    const studentSkills = this.skills.map(s => s.name.toLowerCase());
    const requiredSkills = internship.requirements.skills.map(s => s.name.toLowerCase());
    const matchedSkills = requiredSkills.filter(rs => studentSkills.includes(rs));
    matchScore.skills = (matchedSkills.length / requiredSkills.length) * 100;
  }
  
  // Education matching
  if (internship.requirements?.education?.level) {
    const eduLevels = ['high-school', 'associate', 'bachelor', 'master', 'phd'];
    const requiredLevel = eduLevels.indexOf(internship.requirements.education.level);
    const studentLevel = Math.max(...this.education.map(e => eduLevels.indexOf(e.degree)));
    matchScore.education = studentLevel >= requiredLevel ? 100 : 50;
  }
  
  // Experience matching
  if (internship.requirements?.experience?.yearsMin) {
    const reqExp = internship.requirements.experience.yearsMin;
    matchScore.experience = this.totalExperience >= reqExp ? 100 : 
                           (this.totalExperience / reqExp) * 100;
  }
  
  // Location matching
  if (internship.location?.type === 'remote' || 
      this.preferences?.internshipTypes?.includes('remote')) {
    matchScore.location = 100;
  } else if (internship.location?.city) {
    const matches = this.preferences?.locations?.some(loc => 
      loc.city === internship.location.city
    );
    matchScore.location = matches ? 100 : 30;
  }
  
  // Calculate overall score
  matchScore.overall = (
    matchScore.skills * 0.4 +
    matchScore.education * 0.2 +
    matchScore.experience * 0.2 +
    matchScore.location * 0.2
  );
  
  return matchScore;
};

// ═══════════════════════════════════════════════════════════
// STATIC METHODS
// ═══════════════════════════════════════════════════════════

// Find students by skills
studentProfileSchema.statics.findBySkills = function(skills, minLevel = 'beginner') {
  const levelOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
  const minLevelIndex = levelOrder.indexOf(minLevel);
  
  return this.find({
    skills: {
      $elemMatch: {
        name: { $in: skills },
        level: { $in: levelOrder.slice(minLevelIndex) }
      }
    }
  });
};

// Find students graduating in year
studentProfileSchema.statics.findByGraduationYear = function(year) {
  return this.find({
    'education.graduationYear': year,
    'education.current': true
  });
};

// Find students near location
studentProfileSchema.statics.findNearLocation = function(longitude, latitude, maxDistance = 50000) {
  return this.find({
    'personalInfo.location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    }
  });
};

// Get top students by profile completeness
studentProfileSchema.statics.getTopProfiles = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ profileCompleteness: -1 })
    .limit(limit)
    .populate('user', 'email subscription');
};

// Search students with filters
studentProfileSchema.statics.searchWithFilters = function(filters) {
  const query = { status: 'active' };
  
  if (filters.skills?.length) {
    query['skills.name'] = { $in: filters.skills };
  }
  
  if (filters.graduationYear) {
    query['education.graduationYear'] = filters.graduationYear;
  }
  
  if (filters.industries?.length) {
    query['preferences.industries'] = { $in: filters.industries };
  }
  
  if (filters.minCompleteness) {
    query.profileCompleteness = { $gte: filters.minCompleteness };
  }
  
  if (filters.searchText) {
    query.$text = { $search: filters.searchText };
  }
  
  return this.find(query);
};

// ═══════════════════════════════════════════════════════════
// QUERY HELPERS
// ═══════════════════════════════════════════════════════════

studentProfileSchema.query.active = function() {
  return this.where({ status: 'active' });
};

studentProfileSchema.query.withResume = function() {
  return this.where({ 'resume.original.fileUrl': { $exists: true } });
};

studentProfileSchema.query.availableNow = function() {
  return this.where({
    $or: [
      { 'preferences.availability.startDate': { $lte: new Date() } },
      { 'preferences.availability.startDate': { $exists: false } }
    ]
  });
};

studentProfileSchema.query.byInternshipType = function(type) {
  return this.where({ 'preferences.internshipTypes': type });
};

// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════

export default mongoose.model('StudentProfile', studentProfileSchema);

/**
 * 🎓 USAGE EXAMPLES:
 * 
 * // Create profile
 * const profile = await StudentProfile.create({
 *   user: userId,
 *   personalInfo: {
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     phone: '+1234567890'
 *   },
 *   education: [{
 *     institution: 'MIT',
 *     degree: 'bachelor',
 *     major: 'Computer Science',
 *     graduationYear: 2025
 *   }],
 *   skills: [
 *     { name: 'JavaScript', category: 'technical', level: 'advanced' },
 *     { name: 'React', category: 'framework', level: 'intermediate' }
 *   ]
 * });
 * 
 * // Find by skills
 * const reactDevs = await StudentProfile.findBySkills(['React', 'Node.js'], 'intermediate');
 * 
 * // Check profile completeness
 * const score = profile.calculateCompleteness();
 * 
 * // Increment view
 * await profile.incrementView(organizationId);
 * 
 * // Match with internship
 * const matchScore = profile.matchesInternship(internship);
 * 
 * // Search with filters
 * const results = await StudentProfile.searchWithFilters({
 *   skills: ['React', 'Python'],
 *   graduationYear: 2025,
 *   minCompleteness: 70
 * });
 */