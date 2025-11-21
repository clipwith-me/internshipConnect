// backend/src/controllers/student.controller.js

import StudentProfile from '../models/StudentProfile.js';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile-pictures/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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

    // Store the file path (in production, this would be a Cloudinary URL)
    const fileUrl = `http://localhost:5000/uploads/profile-pictures/${req.file.filename}`;

    // ✅ FIX: Store as object matching schema (profilePicture: { url, publicId })
    profile.personalInfo.profilePicture = {
      url: fileUrl,
      publicId: req.file.filename  // For local storage, use filename as ID
    };

    await profile.save();

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: fileUrl,
        url: fileUrl // Backwards compatibility
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
