// backend/src/controllers/organization.controller.js

import OrganizationProfile from '../models/OrganizationProfile.js';
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
 * @desc    Get organization profile
 * @route   GET /api/organizations/profile
 * @access  Private (Organization only)
 */
export const getProfile = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // ✅ PERFORMANCE: Use lean() for faster queries (returns plain JS objects)
    let profile = await OrganizationProfile.findOne({ user: req.user._id }).lean();

    // If profile doesn't exist, create a default one with minimal required fields
    // Note: Empty strings don't satisfy Mongoose 'required' validation, so we use placeholder values
    if (!profile) {
      console.log('No profile found for organization, creating default profile...');
      profile = new OrganizationProfile({
        user: req.user._id,
        companyInfo: {
          name: `Company_${req.user._id.toString().slice(-8)}`, // Temporary unique name
          industry: 'technology',
          companySize: '1-10',
          founded: new Date().getFullYear(),
          headquarters: {
            city: 'Not specified',
            state: '',
            country: 'Not specified'
          },
          website: ''
        },
        description: {
          short: 'Company description coming soon',
          full: 'Full company description will be added here. Please update your profile to provide more information about your organization.'
        },
        contactInfo: {
          primaryEmail: req.user.email,
          phone: '',
          hrEmail: ''
        },
        statistics: {
          totalInternships: 0,
          activeInternships: 0,
          totalApplications: 0,
          totalHires: 0
        },
        verification: {
          status: 'unverified',
          trustScore: 0
        }
      });
      await profile.save();
      console.log('Default organization profile created successfully');
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
 * @desc    Update organization profile
 * @route   PUT /api/organizations/profile
 * @access  Private (Organization only)
 */
export const updateProfile = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    let profile = await OrganizationProfile.findOne({ user: req.user._id });

    // If profile doesn't exist, create it
    if (!profile) {
      console.log('No profile found during update, creating new profile...');
      profile = new OrganizationProfile({
        user: req.user._id,
        companyInfo: {
          name: req.body.companyInfo?.name || `Company_${req.user._id.toString().slice(-8)}`,
          industry: req.body.companyInfo?.industry || 'technology',
          companySize: req.body.companyInfo?.companySize || '1-10',
          founded: req.body.companyInfo?.founded || new Date().getFullYear(),
          headquarters: {
            city: req.body.companyInfo?.headquarters?.city || 'Not specified',
            state: req.body.companyInfo?.headquarters?.state || '',
            country: req.body.companyInfo?.headquarters?.country || 'Not specified'
          },
          website: req.body.companyInfo?.website || ''
        },
        description: {
          short: req.body.description?.short || 'Company description coming soon',
          full: req.body.description?.full || 'Full company description will be added here.'
        },
        contactInfo: {
          primaryEmail: req.body.contactInfo?.primaryEmail || req.user.email,
          phone: req.body.contactInfo?.phone || '',
          hrEmail: req.body.contactInfo?.hrEmail || ''
        },
        statistics: {
          totalInternships: 0,
          activeInternships: 0,
          totalApplications: 0,
          totalHires: 0
        },
        verification: {
          status: 'unverified',
          trustScore: 0
        }
      });
    } else {
      // Helper function to safely convert to object
      const toObj = (val) => val?.toObject ? val.toObject() : val || {};

      // Helper function to filter out empty strings for required fields
      const filterEmpty = (obj, current) => {
        const result = { ...toObj(current) };
        for (const key in obj) {
          if (obj[key] !== '' && obj[key] !== null && obj[key] !== undefined) {
            result[key] = obj[key];
          }
        }
        return result;
      };

      // Update profile fields with deep merge for nested objects
      if (req.body.companyInfo) {
        const companyInfoUpdate = { ...req.body.companyInfo };

        // Handle headquarters separately to avoid overwriting required fields with empty strings
        if (req.body.companyInfo.headquarters) {
          companyInfoUpdate.headquarters = filterEmpty(
            req.body.companyInfo.headquarters,
            profile.companyInfo?.headquarters
          );
        }

        profile.companyInfo = {
          ...toObj(profile.companyInfo),
          ...filterEmpty(companyInfoUpdate, profile.companyInfo),
          headquarters: companyInfoUpdate.headquarters || profile.companyInfo.headquarters,
          logo: req.body.companyInfo.logo || profile.companyInfo.logo,
          coverImage: req.body.companyInfo.coverImage || profile.companyInfo.coverImage
        };
      }

      if (req.body.description) {
        profile.description = filterEmpty(req.body.description, profile.description);
      }

      if (req.body.contactInfo) {
        profile.contactInfo = filterEmpty(req.body.contactInfo, profile.contactInfo);
      }

      if (req.body.culture) {
        profile.culture = { ...toObj(profile.culture), ...req.body.culture };
      }

      if (req.body.socialLinks) {
        profile.socialLinks = { ...toObj(profile.socialLinks), ...req.body.socialLinks };
      }
    }

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
 * @desc    Upload organization logo
 * @route   POST /api/organizations/profile/logo
 * @access  Private (Organization only)
 */
export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const profile = await OrganizationProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    // Store the file path (in production, this would be a Cloudinary URL)
    // ✅ FIX: Store URL string directly for frontend compatibility
    const fileUrl = `http://localhost:5000/uploads/profile-pictures/${req.file.filename}`;

    // Store as string for consistency with frontend expectations
    profile.companyInfo.logo = fileUrl;

    await profile.save();

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: {
        logo: fileUrl,
        url: fileUrl // Backwards compatibility
      }
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload logo'
    });
  }
};

/**
 * @desc    Upload organization cover image
 * @route   POST /api/organizations/profile/cover-image
 * @access  Private (Organization only)
 */
export const uploadCoverImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const profile = await OrganizationProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    // Store the file path (in production, this would be a Cloudinary URL)
    // ✅ FIX: Store URL string directly for frontend compatibility
    const fileUrl = `http://localhost:5000/uploads/profile-pictures/${req.file.filename}`;

    // Store as string for consistency with frontend expectations
    profile.companyInfo.coverImage = fileUrl;

    await profile.save();

    res.json({
      success: true,
      message: 'Cover image uploaded successfully',
      data: {
        coverImage: fileUrl,
        url: fileUrl // Backwards compatibility
      }
    });
  } catch (error) {
    console.error('Upload cover image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload cover image'
    });
  }
};
