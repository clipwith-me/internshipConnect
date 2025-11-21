// backend/src/models/OrganizationProfile.js
import mongoose from 'mongoose';

/**
 * 🎓 LEARNING: OrganizationProfile Schema
 * 
 * Represents companies/organizations posting internships
 * Separate from User for same reasons as StudentProfile
 */

const organizationProfileSchema = new mongoose.Schema({
  // ═══════════════════════════════════════════════════════════
  // CORE FIELDS
  // ═══════════════════════════════════════════════════════════
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // ═══════════════════════════════════════════════════════════
  // COMPANY INFORMATION
  // ═══════════════════════════════════════════════════════════
  
  companyInfo: {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true
    },
    legalName: String,
    logo: {
      url: String,
      publicId: String
    },
    coverImage: {
      url: String,
      publicId: String
    },
    industry: {
      type: String,
      required: true,
      enum: [
        'technology',
        'finance',
        'healthcare',
        'education',
        'retail',
        'manufacturing',
        'consulting',
        'marketing',
        'media',
        'non-profit',
        'government',
        'other'
      ]
    },
    subIndustry: String,
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'],
      required: true
    },
    founded: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear()
    },
    companyType: {
      type: String,
      enum: ['startup', 'small-business', 'enterprise', 'non-profit', 'government']
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid website URL']
    },
  headquarters: {
  address: String,
  city: {
    type: String,
    required: false,
    default: ''
  },
  state: String,
  country: {
    type: String,
    required: false,
    default: ''
  },
  zipCode: String
  // Removed coordinates
},
    officeLocations: [{
      name: String,
      address: String,
      city: String,
      state: String,
      country: String,
      isPrimary: Boolean
    }]
  },
  
  // ═══════════════════════════════════════════════════════════
  // DESCRIPTION & CULTURE
  // ═══════════════════════════════════════════════════════════
  
  description: {
    short: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [250, 'Short description cannot exceed 250 characters']
    },
    full: {
      type: String,
      required: [true, 'Full description is required'],
      maxlength: [2000, 'Full description cannot exceed 2000 characters']
    },
    mission: String,
    vision: String
  },
  
  culture: {
    values: [{
      type: String,
      maxlength: 100
    }],
    benefits: [{
      type: String,
      maxlength: 200
    }],
    workEnvironment: {
      type: String,
      maxlength: 500
    },
    diversity: {
      type: String,
      maxlength: 500
    },
    perks: [String]
  },
  
  // ═══════════════════════════════════════════════════════════
  // MEDIA & SOCIAL
  // ═══════════════════════════════════════════════════════════
  
  media: {
    photos: [{
      url: String,
      publicId: String,
      caption: String
    }],
    videos: [{
      url: String,
      title: String,
      thumbnail: String
    }]
  },
  
  socialLinks: {
    linkedin: {
      type: String,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/.+/, 'Invalid LinkedIn URL']
    },
    twitter: String,
    facebook: String,
    instagram: String,
    youtube: String,
    glassdoor: String
  },
  
  // ═══════════════════════════════════════════════════════════
  // CONTACT INFORMATION
  // ═══════════════════════════════════════════════════════════
  
  contactInfo: {
    primaryEmail: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: String,
    supportEmail: String,
    hrContacts: [{
      name: String,
      title: String,
      email: String,
      phone: String,
      isPrimary: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // ═══════════════════════════════════════════════════════════
  // VERIFICATION
  // ═══════════════════════════════════════════════════════════
  
  verification: {
    status: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified'
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    documents: [{
      type: {
        type: String,
        enum: ['business-license', 'tax-id', 'incorporation', 'other']
      },
      url: String,
      publicId: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    }],
    rejectionReason: String,
    // Trust score (0-100)
    trustScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    }
  },
  
  // ═══════════════════════════════════════════════════════════
  // STATISTICS & ANALYTICS
  // ═══════════════════════════════════════════════════════════
  
  statistics: {
    totalInternships: {
      type: Number,
      default: 0
    },
    activeInternships: {
      type: Number,
      default: 0
    },
    totalApplications: {
      type: Number,
      default: 0
    },
    totalHires: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    responseRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    averageResponseTime: Number // in hours
  },
  
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
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentProfile'
      },
      viewedAt: Date
    }]
  },
  
  // ═══════════════════════════════════════════════════════════
  // MONETIZATION & FEATURES
  // ═══════════════════════════════════════════════════════════
  
  featuredListings: {
    purchased: {
      type: Number,
      default: 0
    },
    remaining: {
      type: Number,
      default: 0
    },
    lastPurchased: Date,
    transactions: [{
      amount: Number,
      quantity: Number,
      purchasedAt: Date,
      paymentId: String
    }]
  },
  
  premiumFeatures: {
    advancedAnalytics: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    bulkPosting: {
      type: Boolean,
      default: false
    },
    aiMatching: {
      type: Boolean,
      default: false
    }
  },
  
  // ═══════════════════════════════════════════════════════════
  // COMPLIANCE & SETTINGS
  // ═══════════════════════════════════════════════════════════
  
  compliance: {
    equalOpportunityEmployer: {
      type: Boolean,
      default: false
    },
    backgroundCheckRequired: {
      type: Boolean,
      default: false
    },
    drugTestRequired: {
      type: Boolean,
      default: false
    }
  },
  
  settings: {
    autoReplyEnabled: {
      type: Boolean,
      default: false
    },
    autoReplyMessage: String,
    emailNotifications: {
      newApplications: {
        type: Boolean,
        default: true
      },
      weeklyDigest: {
        type: Boolean,
        default: true
      }
    },
    privacySettings: {
      showInSearch: {
        type: Boolean,
        default: true
      },
      allowDirectMessages: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // ═══════════════════════════════════════════════════════════
  // STATUS
  // ═══════════════════════════════════════════════════════════
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  suspensionReason: String,
  suspendedUntil: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ═══════════════════════════════════════════════════════════
// INDEXES
// ═══════════════════════════════════════════════════════════

// ✅ PERFORMANCE: Critical indexes for fast queries
// Note: 'user' and 'companyInfo.name' already have unique:true which creates indexes
// Only add indexes that don't have unique:true or index:true in schema
organizationProfileSchema.index({ 'companyInfo.industry': 1 });
organizationProfileSchema.index({ 'verification.status': 1 });
organizationProfileSchema.index({ status: 1 });
organizationProfileSchema.index({ createdAt: -1 });

// ═══════════════════════════════════════════════════════════
// VIRTUALS
// ═══════════════════════════════════════════════════════════

// Virtual for posted internships
organizationProfileSchema.virtual('internships', {
  ref: 'Internship',
  localField: '_id',
  foreignField: 'organization'
});

// Virtual for reviews
organizationProfileSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'organization'
});

// Check if verified
organizationProfileSchema.virtual('isVerified').get(function() {
  return this.verification.status === 'verified';
});

// Calculate company age
organizationProfileSchema.virtual('companyAge').get(function() {
  if (!this.companyInfo.founded) return null;
  return new Date().getFullYear() - this.companyInfo.founded;
});

// ═══════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════

// Update trust score before saving
organizationProfileSchema.pre('save', function(next) {
  if (this.isModified('verification') || this.isModified('statistics')) {
    this.calculateTrustScore();
  }
  next();
});

// ═══════════════════════════════════════════════════════════
// INSTANCE METHODS
// ═══════════════════════════════════════════════════════════

// Calculate trust score
organizationProfileSchema.methods.calculateTrustScore = function() {
  let score = 50; // Base score
  
  // Verification status
  if (this.verification.status === 'verified') score += 30;
  else if (this.verification.status === 'pending') score += 10;
  
  // Company information completeness
  if (this.companyInfo.website) score += 5;
  if (this.companyInfo.logo?.url) score += 5;
  if (this.socialLinks.linkedin) score += 5;
  if (this.description.full && this.description.full.length > 200) score += 5;
  
  // Activity metrics
  if (this.statistics.totalInternships > 5) score += 10;
  if (this.statistics.averageRating > 4) score += 10;
  if (this.statistics.responseRate > 80) score += 10;
  
  // Penalties
  if (this.status === 'suspended') score -= 30;
  if (this.statistics.responseRate < 30) score -= 10;
  
  this.verification.trustScore = Math.max(0, Math.min(100, score));
  return this.verification.trustScore;
};

// Increment profile view
organizationProfileSchema.methods.incrementView = async function(viewedBy = null) {
  this.analytics.profileViews += 1;
  this.analytics.profileViewsThisMonth += 1;
  
  if (viewedBy) {
    this.analytics.lastViewedBy.unshift({
      student: viewedBy,
      viewedAt: new Date()
    });
    
    if (this.analytics.lastViewedBy.length > 50) {
      this.analytics.lastViewedBy = this.analytics.lastViewedBy.slice(0, 50);
    }
  }
  
  return await this.save();
};

// Purchase featured listings
organizationProfileSchema.methods.purchaseFeaturedListings = function(quantity, amount, paymentId) {
  this.featuredListings.purchased += quantity;
  this.featuredListings.remaining += quantity;
  this.featuredListings.lastPurchased = new Date();
  this.featuredListings.transactions.push({
    amount,
    quantity,
    purchasedAt: new Date(),
    paymentId
  });
  
  return this.save();
};

// Use a featured listing slot
organizationProfileSchema.methods.useFeaturedListing = function() {
  if (this.featuredListings.remaining > 0) {
    this.featuredListings.remaining -= 1;
    return this.save();
  }
  throw new Error('No featured listing credits remaining');
};

// Update statistics
organizationProfileSchema.methods.updateStatistics = async function() {
  const Internship = mongoose.model('Internship');
  const Application = mongoose.model('Application');
  
  const internships = await Internship.find({ organization: this._id });
  this.statistics.totalInternships = internships.length;
  this.statistics.activeInternships = internships.filter(i => i.status === 'active').length;
  
  const applications = await Application.find({
    internship: { $in: internships.map(i => i._id) }
  });
  this.statistics.totalApplications = applications.length;
  this.statistics.totalHires = applications.filter(a => a.status === 'accepted').length;
  
  return await this.save();
};

// ═══════════════════════════════════════════════════════════
// STATIC METHODS
// ═══════════════════════════════════════════════════════════

// Find verified organizations
organizationProfileSchema.statics.findVerified = function() {
  return this.find({ 'verification.status': 'verified', status: 'active' });
};

// Find by industry
organizationProfileSchema.statics.findByIndustry = function(industry) {
  return this.find({ 
    'companyInfo.industry': industry,
    status: 'active'
  });
};

// Find near location
organizationProfileSchema.statics.findNearLocation = function(longitude, latitude, maxDistance = 100000) {
  return this.find({
    'companyInfo.headquarters.coordinates': {
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

// Get top rated organizations
organizationProfileSchema.statics.getTopRated = function(limit = 10) {
  return this.find({ 
    status: 'active',
    'verification.status': 'verified'
  })
    .sort({ 'statistics.averageRating': -1, 'verification.trustScore': -1 })
    .limit(limit);
};

// Search with filters
organizationProfileSchema.statics.searchWithFilters = function(filters) {
  const query = { status: 'active' };
  
  if (filters.industry) {
    query['companyInfo.industry'] = filters.industry;
  }
  
  if (filters.companySize) {
    query['companyInfo.companySize'] = filters.companySize;
  }
  
  if (filters.verified) {
    query['verification.status'] = 'verified';
  }
  
  if (filters.minTrustScore) {
    query['verification.trustScore'] = { $gte: filters.minTrustScore };
  }
  
  if (filters.searchText) {
    query.$text = { $search: filters.searchText };
  }
  
  return this.find(query);
};

// ═══════════════════════════════════════════════════════════
// QUERY HELPERS
// ═══════════════════════════════════════════════════════════

organizationProfileSchema.query.active = function() {
  return this.where({ status: 'active' });
};

organizationProfileSchema.query.verified = function() {
  return this.where({ 'verification.status': 'verified' });
};

organizationProfileSchema.query.withActiveInternships = function() {
  return this.where({ 'statistics.activeInternships': { $gt: 0 } });
};

organizationProfileSchema.query.highTrustScore = function(minScore = 70) {
  return this.where({ 'verification.trustScore': { $gte: minScore } });
};

// ═══════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════

export default mongoose.model('OrganizationProfile', organizationProfileSchema);

/**
 * 🎓 USAGE EXAMPLES:
 * 
 * // Create organization
 * const org = await OrganizationProfile.create({
 *   user: userId,
 *   companyInfo: {
 *     name: 'TechCorp',
 *     industry: 'technology',
 *     companySize: '51-200',
 *     website: 'https://techcorp.com',
 *     headquarters: {
 *       city: 'San Francisco',
 *       country: 'USA'
 *     }
 *   },
 *   description: {
 *     short: 'Leading tech company',
 *     full: 'We build amazing products...'
 *   },
 *   contactInfo: {
 *     primaryEmail: 'hr@techcorp.com'
 *   }
 * });
 * 
 * // Find verified organizations
 * const verified = await OrganizationProfile.findVerified();
 * 
 * // Purchase featured listings
 * await org.purchaseFeaturedListings(5, 49.99, 'stripe_payment_id');
 * 
 * // Calculate trust score
 * const score = org.calculateTrustScore();
 * 
 * // Search with filters
 * const results = await OrganizationProfile.searchWithFilters({
 *   industry: 'technology',
 *   verified: true,
 *   minTrustScore: 70
 * });
 */