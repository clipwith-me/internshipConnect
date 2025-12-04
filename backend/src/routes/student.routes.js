// backend/src/routes/student.routes.js

import express from 'express';
import { getProfile, updateProfile, uploadProfilePicture, upload, searchStudents, toggleFeatured } from '../controllers/student.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { profileUpdateLimiter, uploadLimiter } from '../middleware/security.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Search students (for organizations)
router.get('/search', searchStudents);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', profileUpdateLimiter, updateProfile);

// Featured profile toggle (Pro feature)
router.put('/featured', profileUpdateLimiter, toggleFeatured);

// Profile picture upload
router.post('/profile/picture', uploadLimiter, upload.single('profilePicture'), uploadProfilePicture);

export default router;
