// backend/src/middleware/upload.middleware.js

import multer from 'multer';

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  resume: 5 * 1024 * 1024, // 5MB
  image: 2 * 1024 * 1024,  // 2MB
  document: 10 * 1024 * 1024, // 10MB
};

// Allowed file types
const ALLOWED_FILE_TYPES = {
  resume: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  coverLetter: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
};

/**
 * Configure multer for memory storage
 * Files are stored in memory as Buffer objects
 */
const storage = multer.memoryStorage();

/**
 * File filter function
 */
const createFileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

/**
 * Resume upload middleware
 */
export const uploadResume = multer({
  storage,
  limits: {
    fileSize: FILE_SIZE_LIMITS.resume,
  },
  fileFilter: createFileFilter(ALLOWED_FILE_TYPES.resume),
}).single('resume');

/**
 * Profile image upload middleware
 */
export const uploadProfileImage = multer({
  storage,
  limits: {
    fileSize: FILE_SIZE_LIMITS.image,
  },
  fileFilter: createFileFilter(ALLOWED_FILE_TYPES.image),
}).single('profileImage');

/**
 * Company logo upload middleware
 */
export const uploadCompanyLogo = multer({
  storage,
  limits: {
    fileSize: FILE_SIZE_LIMITS.image,
  },
  fileFilter: createFileFilter(ALLOWED_FILE_TYPES.image),
}).single('logo');

/**
 * Multiple documents upload middleware
 */
export const uploadDocuments = multer({
  storage,
  limits: {
    fileSize: FILE_SIZE_LIMITS.document,
    files: 5, // Maximum 5 files
  },
  fileFilter: createFileFilter(ALLOWED_FILE_TYPES.document),
}).array('documents', 5);

/**
 * Cover letter upload middleware (for applications)
 * Supports: pdf, doc, docx, txt - max 2MB
 */
export const uploadCoverLetter = multer({
  storage,
  limits: {
    fileSize: FILE_SIZE_LIMITS.image, // 2MB limit
  },
  fileFilter: createFileFilter(ALLOWED_FILE_TYPES.coverLetter),
}).single('coverLetterFile');

/**
 * Error handling middleware for multer
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 5MB for resumes and 2MB for images.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum 5 files allowed.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected field name in file upload.',
      });
    }
  }

  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message || 'File upload error',
    });
  }

  next();
};

export default {
  uploadResume,
  uploadProfileImage,
  uploadCompanyLogo,
  uploadDocuments,
  uploadCoverLetter,
  handleUploadError,
};
