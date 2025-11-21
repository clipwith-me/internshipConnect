// backend/src/models/Internship.js
import mongoose from 'mongoose';

/**
 * 🎓 LEARNING: Internship Schema
 * 
 * Core entity of the platform - represents job postings
 * Includes AI matching metadata and featured listing support
 */

const internshipSchema = new mongoose.Schema({
  // ═══════════════════════════════════════════════════════════
  // BASIC INFORMATION
  // ═══════════════════════════════════════════════════════════
  
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrganizationProfile',
    required: true,
    index: true
  },
  
  title: {
    type: String,
    required: [true, 'Internship title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [50, 'Description must be at least 50 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },

  // ═══════════════════════════════════════════════════════════
  // RESPONSIBILITIES & REQUIREMENTS
  // ═══════════════════════════════════════════════════════════

  responsibilities: [{
    type: String,
    maxlength: 500
  }],
  
  requirements: {
    education: {
      level: {
        type: String,
        enum: ['high-school', 'undergraduate', 'graduate', 'phd', 'any'],
        default: 'any'
      },
      majors: [String],
      minGPA: {
        type: Number,
        min: 0,
        max: 4.0
      }
    },
    
    skills: [{
      name: {
        type: String,
        required: true
      },
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
      },
      required: {
        type: Boolean,
        default: false
      },
      // 🎓 AI: Vector embedding for semantic matching
      embedding: {
        type: [Number],
        select: false
      }
    }],
    
    experience: {
      required: {
        type: Boolean,
        default: false
      },
      yearsMin: {
        type: Number,
        min: 0
      },
      yearsMax: {
        type: Number,
        min: 0
      },
      type: [String] // e.g., ['internship', 'part-time', 'volunteer']
    },
    
    languages: [{
      language: String,
      proficiency: {
        type: String,
        enum: ['elementary', 'limited-working', 'professional', 'native']
      }
    }],
    
    certifications: [String],
    
    other: [String]
  },
  
  // ═══════════════════════════════════════════════════════════
  // LOCATION & WORK ARRANGEMENT
  // ═══════════════════════════════════════════════════════════
  
  location: {
  type: {
    type: String,
    enum: ['remote', 'onsite', 'hybrid'],
    required: true
  },
  address: String,
  city: String,
  state: String,
  country: String,
  zipCode: String,
  // Removed coordinates
  remoteFlexibility: {
    type: String,
    enum: ['full-remote', 'mostly-remote', 'hybrid', 'mostly-onsite']
  },
  officeVisits: String
},
  
  // ═══════════════════════════════════════════════════════════
  // COMPENSATION & BENEFITS
  // ═══════════════════════════════════════════════════════════
  
  compensation: {
    type: {
      type: String,
      enum: ['paid', 'unpaid', 'stipend', 'commission', 'negotiable'],
      required: true
    },
    amount: {
      min: {
        type: Number,
        min: 0
      },
      max: {
        type: Number,
        min: 0
      },
      currency: {
        type: String,
        default: 'USD'
      },
      period: {
        type: String,
        enum: ['hourly', 'weekly', 'monthly', 'total'],
        default: 'monthly'
      }
    },
    benefits: [{
      type: String,
      maxlength: 100
    }],
    additionalPerks: [String]
  },
  
  // ═══════════════════════════════════════════════════════════
  // DURATION & TIMELINE
  // ═══════════════════════════════════════════════════════════
  
  duration: {
    length: {
      type: String,
      required: true // e.g., '3 months', '6 months', 'Summer 2025'
    },
    hoursPerWeek: {
      min: Number,
      max: Number
    },
    flexible: {
      type: Boolean,
      default: false
    }
  },
  
  timeline: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    applicationDeadline: {
      type: Date,
      required: true
    },
    // When organization will start reviewing applications
    reviewStartDate: Date,
    expectedDecisionDate: Date
  },
  
  // ═══════════════════════════════════════════════════════════
  // POSITIONS & AVAILABILITY
  // ═══════════════════════════════════════════════════════════
  
  positions: {
    total: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    },
    filled: {
      type: Number,
      default: 0,
      min: 0
    },
    available: {
      type: Number,
      default: 1
    }
  },
  
  // ═══════════════════════════════════════════════════════════
  // APPLICATION PROCESS
  // ═══════════════════════════════════════════════════════════
  
  applicationProcess: {
    requiresCoverLetter: {
      type: Boolean,
      default: false
    },
    requiresResume: {
      type: Boolean,
      default: true
    },
    requiresPortfolio: {
      type: Boolean,
      default: false
    },
    customQuestions: [{
      question: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['text', 'textarea', 'multiple-choice', 'file'],
        default: 'text'
      },
      required: {
        type: Boolean,
        default: false
      },
      options: [String] // For multiple-choice
    }],
    externalApplicationUrl: String, // If they want to redirect
    estimatedResponseTime: String // e.g., '1-2 weeks'
  },
  
  // ═══════════════════════════════════════════════════════════
  // STATUS & VISIBILITY
  // ═══════════════════════════════════════════════════════════
  
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed', 'filled', 'expired'],
    default: 'draft',
    index: true
  },
  
  visibility: {
    type: String,
    enum: ['public', 'unlisted', 'private'],
    default: 'public'
  },
  
  // ═══════════════════════════════════════════════════════════
  // FEATURED & MONETIZATION
  // ═══════════════════════════════════════════════════════════
  
  featured: {
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    featuredUntil: Date,
    featuredAt: Date,
    priority: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // ═══════════════════════════════════════════════════════════
  // AI MATCHING METADATA
  // ═══════════════════════════════════════════════════════════
  
  aiMetadata: {
    // Vector embedding of entire job description
    descriptionEmbedding: {
      type: [Number],
      select: false
    },
    // Extracted keywords for matching
    keywords: [String],
    // Automatically extracted skills
    extractedSkills: [String],
    // Difficulty level (calculated by AI)
    difficultyLevel: {
      type: String,
      enum: ['entry', 'intermediate', 'advanced']
    },
    // AI-generated match criteria
    matchCriteria: {
      mustHave: [String],
      niceToHave: [String],
      dealBreakers: [String]
    },
    // Last time AI processed this listing
    lastProcessed: Date
  },
  
  // ═══════════════════════════════════════════════════════════
  // STATISTICS & ANALYTICS
  // ═══════════════════════════════════════════════════════════
  
  statistics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueViews: {
      type: Number,
      default: 0
    },
    applications: {
      type: Number,
      default: 0
    },
    saves: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }, // (applications / views) * 100
    averageMatchScore: {
      type: Number,
      default: 0
    }
  },
  
  // ═══════════════════════════════════════════════════════════
  // TAGS & CATEGORIES
  // ═══════════════════════════════════════════════════════════
  
  tags: [String],
  
  categories: [{
    type: String,
    enum: [
      'software-development',
      'data-science',
      'design',
      'marketing',
      'sales',
      'finance',
      'hr',
      'operations',
      'research',
      'product-management',
      'consulting',
      'other'
    ]
  }],
  
  // ═══════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════
  
  publishedAt: Date,
  lastModified: Date,
  expiresAt: Date,
  
  // Who can see this internship
  targetAudience: {
    universities: [String],
    majors: [String],
    graduationYears: [Number]
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ═══════════════════════════════════════════════════════════
// INDEXES
// ═══════════════════════════════════════════════════════════

// Geospatial index
//internshipSchema.index({ 'location.coordinates': '2dsphere' });

// Text search
// internshipSchema.index({ title: 'text' });
// internshipSchema.index({ description: 'text' });
// internshipSchema.index({ 'requirements.skills.name': 'text' });


// Common queries
internshipSchema.index({ organization: 1, status: 1 });
internshipSchema.index({ status: 1, publishedAt: -1 });
// internshipSchema.index({ status: 1, 'featured.isFeatured': -1, publishedAt: -1 });
// internshipSchema.index({ 'timeline.applicationDeadline': 1 });
// internshipSchema.index({ categories: 1, status: 1 });
// internshipSchema.index({ 'requirements.skills.name': 1 });
// internshipSchema.index({ 'location.type': 1, status: 1 });

// Compound index for featured listings
internshipSchema.index({ 
  'featured.isFeatured': -1, 
  'featured.priority': -1,
  publishedAt: -1 
});

// ═══════════════════════════════════════════════════════════
// VIRTUALS
// ═══════════════════════════════════════════════════════════

// Applications for this internship
internshipSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'internship'
});

// Check if deadline has passed
internshipSchema.virtual('isExpired').get(function() {
  return this.timeline.applicationDeadline < new Date();
});

// Check if positions are available
internshipSchema.virtual('hasOpenings').get(function() {
  return this.positions.filled < this.positions.total;
});

// Calculate available positions
internshipSchema.virtual('availablePositions').get(function() {
  return Math.max(0, this.positions.total - this.positions.filled);
});

// Check if currently accepting applications
internshipSchema.virtual('isAcceptingApplications').get(function() {
  return this.status === 'active' &&
         !this.isExpired &&
         this.hasOpenings;
});

// ✅ FIX: Format compensation for display to avoid "$[object Object]"
internshipSchema.virtual('compensationDisplay').get(function() {
  if (!this.compensation) return 'Not specified';

  const { type, amount } = this.compensation;

  // Handle unpaid internships
  if (type === 'unpaid') {
    return 'Unpaid';
  }

  // Handle negotiable compensation
  if (type === 'negotiable') {
    return 'Negotiable';
  }

  // Handle paid/stipend/commission with amount
  if (amount && (amount.min !== undefined || amount.max !== undefined)) {
    const currency = amount.currency || 'USD';
    const currencySymbols = {
      'USD': '$',
      'NGN': '₦',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹'
    };
    const symbol = currencySymbols[currency] || currency;

    // Format numbers with commas
    const formatNum = (num) => num?.toLocaleString('en-US') || '0';

    if (amount.min && amount.max) {
      return `${symbol}${formatNum(amount.min)} - ${symbol}${formatNum(amount.max)}`;
    } else if (amount.min) {
      return `${symbol}${formatNum(amount.min)}+`;
    } else if (amount.max) {
      return `Up to ${symbol}${formatNum(amount.max)}`;
    }
  }

  // Fallback for type
  return type.charAt(0).toUpperCase() + type.slice(1);
});

// ═══════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════

// Update positions.available before saving
internshipSchema.pre('save', function(next) {
  this.positions.available = Math.max(0, this.positions.total - this.positions.filled);
  next();
});

// Set publishedAt when status changes to active
internshipSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Auto-expire internships
internshipSchema.pre('save', function(next) {
  if (this.timeline.applicationDeadline < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

// Calculate conversion rate
internshipSchema.pre('save', function(next) {
  if (this.statistics.uniqueViews > 0) {
    this.statistics.conversionRate = 
      (this.statistics.applications / this.statistics.uniqueViews) * 100;
  }
  next();
});

// ═══════════════════════════════════════════════════════════
// INSTANCE METHODS
// ═══════════════════════════════════════════════════════════

// Increment view count
internshipSchema.methods.incrementView = async function(isUnique = false) {
  this.statistics.views += 1;
  if (isUnique) {
    this.statistics.uniqueViews += 1;
  }
  return await this.save();
};

// Increment application count
internshipSchema.methods.incrementApplication = async function() {
  this.statistics.applications += 1;
  return await this.save();
};

// Mark position as filled
internshipSchema.methods.fillPosition = async function() {
  if (this.positions.filled < this.positions.total) {
    this.positions.filled += 1;
    
    if (this.positions.filled >= this.positions.total) {
      this.status = 'filled';
    }
    
    return await this.save();
  }
  throw new Error('No available positions to fill');
};

// Feature this internship
internshipSchema.methods.makeFeatured = async function(duration = 30) {
  this.featured.isFeatured = true;
  this.featured.featuredAt = new Date();
  this.featured.featuredUntil = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
  return await this.save();
};

// Remove featured status
internshipSchema.methods.removeFeatured = async function() {
  this.featured.isFeatured = false;
  this.featured.featuredUntil = null;
  return await this.save();
};

// Check if student matches requirements
internshipSchema.methods.calculateMatchScore = function(studentProfile) {
  let score = 0;
  let maxScore = 0;
  
  // Skills matching (40% weight)
  if (this.requirements.skills && this.requirements.skills.length > 0) {
    const requiredSkills = this.requirements.skills.filter(s => s.required);
    const optionalSkills = this.requirements.skills.filter(s => !s.required);
    const studentSkills = studentProfile.skills.map(s => s.name.toLowerCase());
    
    // Required skills
    const matchedRequired = requiredSkills.filter(rs => 
      studentSkills.includes(rs.name.toLowerCase())
    );
    score += (matchedRequired.length / Math.max(requiredSkills.length, 1)) * 40;
    maxScore += 40;
    
    // Optional skills (bonus)
    const matchedOptional = optionalSkills.filter(os => 
      studentSkills.includes(os.name.toLowerCase())
    );
    score += (matchedOptional.length / Math.max(optionalSkills.length, 1)) * 10;
    maxScore += 10;
  }
  
  // Education matching (20% weight)
  if (this.requirements.education.level && this.requirements.education.level !== 'any') {
    const eduLevels = ['high-school', 'undergraduate', 'graduate', 'phd'];
    const requiredLevel = eduLevels.indexOf(this.requirements.education.level);
    const studentMaxLevel = Math.max(...studentProfile.education.map(e => 
      eduLevels.indexOf(e.degree)
    ));
    
    if (studentMaxLevel >= requiredLevel) {
      score += 20;
    } else {
      score += (studentMaxLevel / requiredLevel) * 20;
    }
    maxScore += 20;
  }
  
  // Experience matching (20% weight)
  if (this.requirements.experience.yearsMin) {
    const reqExp = this.requirements.experience.yearsMin;
    const studentExp = studentProfile.totalExperience || 0;
    
    if (studentExp >= reqExp) {
      score += 20;
    } else {
      score += (studentExp / reqExp) * 20;
    }
    maxScore += 20;
  }
  
  // Location matching (10% weight)
  if (this.location.type === 'remote' || 
      studentProfile.preferences?.internshipTypes?.includes('remote')) {
    score += 10;
  } else if (this.location.city && studentProfile.preferences?.locations) {
    const matches = studentProfile.preferences.locations.some(loc => 
      loc.city === this.location.city
    );
    score += matches ? 10 : 3;
  }
  maxScore += 10;
  
  // Normalize to 0-100 scale
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
};

// ═══════════════════════════════════════════════════════════
// STATIC METHODS
// ═══════════════════════════════════════════════════════════

// Find active internships
internshipSchema.statics.findActive = function() {
  return this.find({ 
    status: 'active',
    'timeline.applicationDeadline': { $gt: new Date() }
  });
};

// Find featured internships
internshipSchema.statics.findFeatured = function() {
  return this.find({
    'featured.isFeatured': true,
    'featured.featuredUntil': { $gt: new Date() },
    status: 'active'
  }).sort({ 'featured.priority': -1, publishedAt: -1 });
};

// Find by skills
internshipSchema.statics.findBySkills = function(skills) {
  return this.find({
    'requirements.skills.name': { $in: skills },
    status: 'active'
  });
};

// Find near location
internshipSchema.statics.findNearLocation = function(longitude, latitude, maxDistance = 50000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    status: 'active'
  });
};

// Search with filters
internshipSchema.statics.searchWithFilters = function(filters) {
  const query = { status: 'active' };
  
  if (filters.skills?.length) {
    query['requirements.skills.name'] = { $in: filters.skills };
  }
  
  if (filters.locationType) {
    query['location.type'] = filters.locationType;
  }
  
  if (filters.categories?.length) {
    query.categories = { $in: filters.categories };
  }
  
  if (filters.compensationType) {
    query['compensation.type'] = filters.compensationType;
  }
  
  if (filters.minStipend) {
    query['compensation.amount.min'] = { $gte: filters.minStipend };
  }
  
  if (filters.searchText) {
    query.$text = { $search: filters.searchText };
  }
  
  return this.find(query);
};

// Get recommendations for student
internshipSchema.statics.getRecommendations = async function(studentProfile, limit = 10) {
  const internships = await this.findActive().populate('organization');
  
  const scored = internships.map(internship => ({
    internship,
    score: internship.calculateMatchScore(studentProfile)
  }));
  
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => ({ ...item.internship.toObject(), matchScore: item.score }));
};

// ═══════════════════════════════════════════════════════════
// QUERY HELPERS
// ═══════════════════════════════════════════════════════════

internshipSchema.query.active = function() {
  return this.where({ status: 'active' });
};

internshipSchema.query.featured = function() {
  return this.where({ 'featured.isFeatured': true });
};

internshipSchema.query.remote = function() {
  return this.where({ 'location.type': 'remote' });
};

internshipSchema.query.paid = function() {
  return this.where({ 'compensation.type': { $in: ['paid', 'stipend'] } });
};

internshipSchema.query.withOpenings = function() {
  return this.where({ $expr: { $lt: ['$positions.filled', '$positions.total'] } });
};

// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════

export default mongoose.model('Internship', internshipSchema);

/**
 * 🎓 USAGE EXAMPLES:
 * 
 * // Create internship
 * const internship = await Internship.create({
 *   organization: orgId,
 *   title: 'Software Engineering Intern',
 *   description: 'Join our team...',
 *   requirements: {
 *     education: {
 *       level: 'undergraduate',
 *       majors: ['Computer Science', 'Software Engineering']
 *     },
 *     skills: [
 *       { name: 'JavaScript', level: 'intermediate', required: true },
 *       { name: 'React', level: 'beginner', required: false }
 *     ]
 *   },
 *   location: {
 *     type: 'remote'
 *   },
 *   compensation: {
 *     type: 'paid',
 *     amount: { min: 2000, max: 3000, currency: 'USD', period: 'monthly' }
 *   },
 *   timeline: {
 *     startDate: new Date('2025-06-01'),
 *     applicationDeadline: new Date('2025-04-30')
 *   },
 *   positions: { total: 3 }
 * });
 * 
 * // Find active internships
 * const active = await Internship.findActive();
 * 
 * // Get recommendations
 * const recommendations = await Internship.getRecommendations(studentProfile);
 * 
 * // Calculate match score
 * const score = internship.calculateMatchScore(studentProfile);
 * 
 * // Make featured
 * await internship.makeFeatured(30); // 30 days
 */