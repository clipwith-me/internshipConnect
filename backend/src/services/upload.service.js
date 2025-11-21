// backend/src/services/upload.service.js

import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import crypto from 'crypto';

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result with URL and public_id
 */
export const uploadToCloudinary = (fileBuffer, options = {}) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured. Add credentials to .env');
  }

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'internship-connect',
      resource_type: options.resourceType || 'auto',
      public_id: options.publicId || undefined,
      overwrite: options.overwrite || false,
      transformation: options.transformation || undefined,
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          resourceType: result.resource_type,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload resume file (PDF, DOC, DOCX)
 */
export const uploadResume = async (fileBuffer, fileName, userId) => {
  const publicId = `resumes/${userId}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

  return await uploadToCloudinary(fileBuffer, {
    folder: 'internship-connect/resumes',
    publicId,
    resourceType: 'raw', // For non-image files
    allowedFormats: ['pdf', 'doc', 'docx'],
  });
};

/**
 * Upload profile image
 */
export const uploadProfileImage = async (fileBuffer, userId) => {
  const publicId = `profiles/${userId}_${Date.now()}`;

  return await uploadToCloudinary(fileBuffer, {
    folder: 'internship-connect/profiles',
    publicId,
    resourceType: 'image',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
};

/**
 * Upload company logo
 */
export const uploadCompanyLogo = async (fileBuffer, organizationId) => {
  const publicId = `logos/${organizationId}_${Date.now()}`;

  return await uploadToCloudinary(fileBuffer, {
    folder: 'internship-connect/logos',
    publicId,
    resourceType: 'image',
    transformation: [
      { width: 200, height: 200, crop: 'fit', background: 'white' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
};

/**
 * Delete file from Cloudinary
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from cloud storage');
  }
};

/**
 * Get signed URL for secure file access
 */
export const getSignedUrl = (publicId, options = {}) => {
  if (!isCloudinaryConfigured()) {
    return null;
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const transformation = options.transformation || [];

  return cloudinary.url(publicId, {
    type: options.type || 'upload',
    resource_type: options.resourceType || 'image',
    transformation,
    sign_url: true,
    timestamp,
  });
};

/**
 * Mock upload for development (when Cloudinary is not configured)
 */
export const mockUpload = (fileBuffer, fileName) => {
  const mockId = `mock_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
  return {
    url: `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(fileName)}`,
    publicId: mockId,
    format: fileName.split('.').pop(),
    bytes: fileBuffer.length,
    resourceType: 'mock',
    isMock: true,
  };
};

export default {
  uploadToCloudinary,
  uploadResume,
  uploadProfileImage,
  uploadCompanyLogo,
  deleteFromCloudinary,
  getSignedUrl,
  mockUpload,
};
