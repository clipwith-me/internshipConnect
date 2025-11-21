// backend/src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * 🎓 LEARNING: User Schema Design
 * 
 * This is the foundation model. Every user (student/org/admin) starts here.
 * We separate authentication data (User) from profile data (StudentProfile/OrgProfile)
 * 
 * Why? Security - we never expose passwords, and can query users without loading full profiles
 */

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,  // Automatically converts to lowercase
    trim: true,       // Removes whitespace
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false  // 🎓 CRITICAL: Never return password in queries by default
  },
  
  role: {
    type: String,
    enum: {
      values: ['student', 'organization', 'admin'],
      message: '{VALUE} is not a valid role'
    },
    required: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Email verification
  verificationToken: String,
  verificationExpires: Date,
  
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Session tracking
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // 🎓 Subscription Management (Embedded Document)
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'pro', 'professional', 'enterprise'],
      default: function() {
        return this.role === 'student' ? 'free' : 'basic';
      }
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'trialing', 'inactive', 'past_due'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    currentPeriodEnd: Date,
    billingPeriod: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    },

    // Stripe integration
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    
    // Feature flags based on plan
    features: {
      aiResumeBuilder: {
        type: Boolean,
        default: false
      },
      featuredApplications: {
        type: Boolean,
        default: false
      },
      unlimitedApplications: {
        type: Boolean,
        default: false
      },
      analyticsAccess: {
        type: Boolean,
        default: false
      }
    }
  }
}, {
  timestamps: true,  // 🎓 Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ═══════════════════════════════════════════════════════════
// 🎓 INDEXES - Critical for Performance
// ═══════════════════════════════════════════════════════════

// Single field indexes
// Note: email already has unique index from schema definition (line 19)
userSchema.index({ role: 1 });

// Compound index for common queries
userSchema.index({ email: 1, role: 1 });
userSchema.index({ 'subscription.plan': 1, 'subscription.status': 1 });

// ═══════════════════════════════════════════════════════════
// 🎓 VIRTUAL PROPERTIES - Computed fields not stored in DB
// ═══════════════════════════════════════════════════════════

// Get the profile based on role
userSchema.virtual('profile', {
  ref: function() {
    return this.role === 'student' ? 'StudentProfile' : 'OrganizationProfile';
  },
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

// Check if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ═══════════════════════════════════════════════════════════
// 🎓 MIDDLEWARE (HOOKS) - Code that runs before/after operations
// ═══════════════════════════════════════════════════════════

// Pre-save: Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save: Set subscription features based on plan
userSchema.pre('save', function(next) {
  if (this.isModified('subscription.plan')) {
    const planFeatures = {
      free: {
        aiResumeBuilder: false,
        featuredApplications: false,
        unlimitedApplications: false,
        analyticsAccess: false
      },
      premium: {
        aiResumeBuilder: true,
        featuredApplications: true,
        unlimitedApplications: false,
        analyticsAccess: true
      },
      enterprise: {
        aiResumeBuilder: true,
        featuredApplications: true,
        unlimitedApplications: true,
        analyticsAccess: true
      }
    };
    
    this.subscription.features = planFeatures[this.subscription.plan];
  }
  next();
});

// ═══════════════════════════════════════════════════════════
// 🎓 INSTANCE METHODS - Methods available on document instances
// ═══════════════════════════════════════════════════════════

// Compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
userSchema.methods.generateVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token; // Return unhashed token to send via email
};

// Generate password reset token
userSchema.methods.generateResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return token;
};

// Handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
  // Reset if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const needsLock = this.loginAttempts + 1 >= 5; // Lock after 5 attempts
  
  if (needsLock) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hour lock
  }
  
  return this.updateOne(updates);
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 }
  });
};

// Check if user has a feature
userSchema.methods.hasFeature = function(featureName) {
  return this.subscription.features[featureName] === true;
};

// Upgrade subscription
userSchema.methods.upgradeSubscription = async function(plan, stripeData = {}) {
  this.subscription.plan = plan;
  this.subscription.status = 'active';
  this.subscription.startDate = Date.now();
  this.subscription.endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
  
  if (stripeData.customerId) {
    this.subscription.stripeCustomerId = stripeData.customerId;
  }
  if (stripeData.subscriptionId) {
    this.subscription.stripeSubscriptionId = stripeData.subscriptionId;
  }
  
  return await this.save();
};

// ═══════════════════════════════════════════════════════════
// 🎓 STATIC METHODS - Methods available on the Model itself
// ═══════════════════════════════════════════════════════════

// Find user by email (case-insensitive)
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Find user with password for authentication
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  if (user.isLocked) {
    throw new Error('Account is temporarily locked. Try again later.');
  }
  
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    await user.incLoginAttempts();
    throw new Error('Invalid credentials');
  }
  
  await user.resetLoginAttempts();
  
  return user;
};

// Get users by subscription plan
userSchema.statics.findBySubscriptionPlan = function(plan) {
  return this.find({ 'subscription.plan': plan });
};

// Count users by role
userSchema.statics.countByRole = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);
};

// ═══════════════════════════════════════════════════════════
// 🎓 QUERY HELPERS - Chainable query builders
// ═══════════════════════════════════════════════════════════

userSchema.query.byRole = function(role) {
  return this.where({ role });
};

userSchema.query.verified = function() {
  return this.where({ isVerified: true });
};

userSchema.query.active = function() {
  return this.where({ isActive: true });
};

userSchema.query.premium = function() {
  return this.where({ 'subscription.plan': { $in: ['premium', 'enterprise'] } });
};

// ═══════════════════════════════════════════════════════════
// EXPORT MODEL
// ═══════════════════════════════════════════════════════════

export default mongoose.model('User', userSchema);

/**
 * 🎓 USAGE EXAMPLES:
 * 
 * // Create user
 * const user = await User.create({
 *   email: 'student@example.com',
 *   password: 'securePassword123',
 *   role: 'student'
 * });
 * 
 * // Find by email
 * const user = await User.findByEmail('student@example.com');
 * 
 * // Authenticate
 * const user = await User.findByCredentials('email@test.com', 'password');
 * 
 * // Check feature access
 * if (user.hasFeature('aiResumeBuilder')) {
 *   // Allow access
 * }
 * 
 * // Query builders
 * const premiumStudents = await User.find()
 *   .byRole('student')
 *   .premium()
 *   .verified()
 *   .exec();
 */