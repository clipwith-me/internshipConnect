// backend/src/controllers/student.controller.js

import StudentProfile from '../models/StudentProfile.js';
import multer from 'multer';
import path from 'path';
import { uploadProfileImage, deleteFromCloudinary } from '../services/upload.service.js';
import { isCloudinaryConfigured } from '../config/cloudinary.js';
import { escapeRegex, validatePagination } from '../utils/security.js';
import { toStringList } from '../utils/requestSafety.js';

// Configure multer for file uploads - use memory storage for Cloudinary
const storage = multer.memoryStorage(); // Store in memory buffer for Cloudinary upload

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

/**
 * @desc    Get student profile
 * @route   GET /api/students/profile
 * @access  Private (Student only)
 */
export const getProfile = async (req, res) => {
  try {
    // ✅ PERFORMANCE: Use lean() for faster queries (returns plain JS objects)
    let profile = await StudentProfile.findOne({ user: req.user._id }).lean();

    // If profile doesn't exist, create a default one
    if (!profile) {
      console.log('No profile found for user, creating default profile...');
      profile = new StudentProfile({
        user: req.user._id,
        personalInfo: {
          firstName: '',
          lastName: '',
          phone: '',
          dateOfBirth: null,
          location: {
            city: '',
            state: '',
            country: ''
          },
          bio: ''
        },
        socialLinks: {
          linkedin: '',
          github: '',
          portfolio: '',
          website: ''
        },
        education: [],
        skills: [],
        experience: [],
        preferences: {
          internshipTypes: [],
          industries: [],
          roles: [],
          locations: [],
          compensation: {
            minStipend: 0,
            currency: 'USD'
          }
        }
      });
      await profile.save();
      console.log('Default profile created successfully');
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
};

/**
 * @desc    Update student profile
 * @route   PUT /api/students/profile
 * @access  Private (Student only)
 */
export const updateProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    // Update profile fields
    if (req.body.personalInfo) {
      // Extract bio from personalInfo if it exists there (frontend sends it there)
      const { bio, ...restPersonalInfo } = req.body.personalInfo;
      profile.personalInfo = { ...profile.personalInfo, ...restPersonalInfo };
      if (bio !== undefined) profile.bio = bio;
    }
    if (req.body.bio !== undefined) profile.bio = req.body.bio;
    // Short professional headline shown on candidate cards (schema caps at 120).
    if (typeof req.body.headline === 'string') profile.headline = req.body.headline.trim();
    // Students control whether employers can find them in candidate search.
    if (['public', 'private'].includes(req.body.visibility)) profile.visibility = req.body.visibility;
    if (req.body.socialLinks) profile.socialLinks = { ...profile.socialLinks, ...req.body.socialLinks };
    if (req.body.education) profile.education = req.body.education;
    if (req.body.skills) profile.skills = req.body.skills;
    if (req.body.experience) profile.experience = req.body.experience;
    if (req.body.preferences) profile.preferences = { ...profile.preferences, ...req.body.preferences };

    await profile.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Update profile error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

/**
 * @desc    Upload student profile picture
 * @route   POST /api/students/profile/picture
 * @access  Private (Student only)
 */
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const profile = await StudentProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    let uploadResult;

    // ✅ FIX: Use Cloudinary for image upload (production-ready)
    if (isCloudinaryConfigured()) {
      try {
        // Delete old image from Cloudinary if exists
        if (profile.personalInfo.profilePicture?.publicId &&
            !profile.personalInfo.profilePicture.publicId.startsWith('mock_')) {
          try {
            await deleteFromCloudinary(profile.personalInfo.profilePicture.publicId);
          } catch (deleteError) {
            console.warn('Failed to delete old profile picture:', deleteError.message);
          }
        }

        // Upload new image to Cloudinary
        uploadResult = await uploadProfileImage(req.file.buffer, req.user._id.toString());

        console.log('✅ Profile picture uploaded to Cloudinary:', uploadResult.url);
      } catch (cloudinaryError) {
        console.error('Cloudinary upload failed:', cloudinaryError);
        return res.status(500).json({
          success: false,
          error: 'Failed to upload image to cloud storage'
        });
      }
    } else {
      // Fallback: Local file storage (development only)
      console.warn('⚠️  Cloudinary not configured - using placeholder image');
      uploadResult = {
        url: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.personalInfo.firstName || 'User')}&size=400&background=0078D4&color=fff`,
        publicId: `local_${Date.now()}`
      };
    }

    // Store as object matching schema (profilePicture: { url, publicId })
    profile.personalInfo.profilePicture = {
      url: uploadResult.url,
      publicId: uploadResult.publicId
    };

    await profile.save();

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: uploadResult.url,
        url: uploadResult.url // Backwards compatibility
      }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload profile picture'
    });
  }
};

/**
 * @desc    Search student profiles (for organizations)
 * @route   GET /api/students/search
 * @access  Private (Organization only)
 */
export const searchStudents = async (req, res) => {
  try {
    // Only organizations can search for students
    if (req.user.role !== 'organization') {
      return res.status(403).json({
        success: false,
        error: 'Only organizations can search for students'
      });
    }

    const { search, skills, education, experience, location } = req.query;

    // Pagination is clamped so a caller cannot request an unbounded page.
    const { page, limit } = validatePagination(req.query.page, req.query.limit ?? 20, 50);

    // Build query. Each text filter is escaped (no regex injection / ReDoS) and
    // collected in $and so that search + location can be combined instead of
    // one silently overwriting the other.
    const query = {
      status: 'active',
      visibility: 'public'
    };
    const and = [];

    // Text search in name, bio, headline
    if (typeof search === 'string' && search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim().slice(0, 100)), 'i');
      and.push({
        $or: [
          { 'personalInfo.firstName': rx },
          { 'personalInfo.lastName': rx },
          { bio: rx },
          { headline: rx }
        ]
      });
    }

    // Filter by skills (accepts "a,b" or repeated ?skills[]=a)
    const skillsArray = toStringList(skills);
    if (skillsArray.length) {
      // exact, case-insensitive match ("react" finds "React")
      query['skills.name'] = {
        $in: skillsArray.map((n) => new RegExp(`^${escapeRegex(n.slice(0, 50))}$`, 'i')),
      };
    }

    // Filter by education level (string only; objects are rejected)
    if (typeof education === 'string' && education.trim()) {
      query['education.degree'] = education.trim();
    }

    // Filter to students who have listed at least one experience entry
    if (experience) {
      query['experience.0'] = { $exists: true };
    }

    // Filter by location
    if (typeof location === 'string' && location.trim()) {
      const rx = new RegExp(escapeRegex(location.trim().slice(0, 100)), 'i');
      and.push({
        $or: [
          { 'personalInfo.location.city': rx },
          { 'personalInfo.location.country': rx }
        ]
      });
    }

    if (and.length) query.$and = and;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with featured profile prioritization. Only fields needed to
    // render a candidate card are returned: no email, phone, date of birth,
    // street address or subscription/billing data is exposed to employers here.
    const students = await StudentProfile.find(query)
      .select(
        'personalInfo.firstName personalInfo.lastName personalInfo.profilePicture ' +
        'personalInfo.location.city personalInfo.location.country ' +
        'headline bio skills education featured profileCompleteness updatedAt'
      )
      .sort({
        'featured.isFeatured': -1,     // Featured profiles first
        'featured.priority': -1,        // Higher priority first within featured
        profileCompleteness: -1,        // Complete profiles next
        updatedAt: -1                   // Recent updates last
      })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await StudentProfile.countDocuments(query);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: students.length,
          totalStudents: total
        }
      }
    });
  } catch (error) {
    console.error('Search students error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search students'
    });
  }
};

/**
 * @desc    Toggle featured profile status (Pro feature)
 * @route   PUT /api/students/featured
 * @access  Private (Student with Pro subscription only)
 */
export const toggleFeatured = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    // Check if user has Pro subscription
    const hasPro = req.user.subscription?.plan === 'pro' &&
                   req.user.subscription?.status === 'active';

    if (!hasPro) {
      return res.status(403).json({
        success: false,
        error: 'Featured profiles are only available with Pro subscription',
        requiredPlan: 'pro'
      });
    }

    // Toggle featured status
    const { isFeatured } = req.body;

    profile.featured.isFeatured = isFeatured;

    if (isFeatured) {
      // Set featured since date if enabling
      if (!profile.featured.featuredSince) {
        profile.featured.featuredSince = new Date();
      }
      // Set default priority if not set
      if (!profile.featured.priority) {
        profile.featured.priority = 50; // Default medium priority
      }
    } else {
      // Clear featured until date when disabling
      profile.featured.featuredUntil = new Date();
    }

    await profile.save();

    res.json({
      success: true,
      message: isFeatured
        ? 'Your profile is now featured! You\'ll appear higher in organization searches.'
        : 'Featured profile disabled',
      data: {
        isFeatured: profile.featured.isFeatured,
        featuredSince: profile.featured.featuredSince,
        priority: profile.featured.priority
      }
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update featured status'
    });
  }
};
