// backend/src/controllers/student.controller.js

import StudentProfile from '../models/StudentProfile.js';
import multer from 'multer';
import path from 'path';
import { uploadProfileImage, deleteFromCloudinary } from '../services/upload.service.js';
import { isCloudinaryConfigured } from '../config/cloudinary.js';

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
    if (req.body.personalInfo) profile.personalInfo = { ...profile.personalInfo, ...req.body.personalInfo };
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

    const {
      search,
      skills,
      education,
      experience,
      location,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {
      status: 'active',
      visibility: 'public'
    };

    // Text search in name, bio, headline
    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { headline: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query['skills.name'] = { $in: skillsArray };
    }

    // Filter by education level
    if (education) {
      query['education.degree'] = education;
    }

    // Filter by experience (number of experiences)
    if (experience) {
      const expCount = parseInt(experience);
      query['experience'] = { $exists: true, $not: { $size: 0 } };
    }

    // Filter by location
    if (location) {
      query.$or = [
        { 'personalInfo.location.city': { $regex: location, $options: 'i' } },
        { 'personalInfo.location.country': { $regex: location, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with featured profile prioritization
    const students = await StudentProfile.find(query)
      .populate('user', 'email subscription')
      .sort({
        'featured.isFeatured': -1,     // Featured profiles first
        'featured.priority': -1,        // Higher priority first within featured
        profileCompleteness: -1,        // Complete profiles next
        updatedAt: -1                   // Recent updates last
      })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await StudentProfile.countDocuments(query);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          current: parseInt(page),
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
