// backend/src/routes/student.routes.js

import express from 'express';
import { getProfile, updateProfile, uploadProfilePicture, upload, searchStudents, toggleFeatured } from '../controllers/student.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { profileUpdateLimiter, uploadLimiter } from '../middleware/security.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Search students (employers only; admins pass through authorize)
router.get('/search', authorize('organization'), searchStudents);

// Profile routes. Student-only: the handlers lazily create a StudentProfile, so
// without this guard any other role (organization, university) that called them
// would end up with a stray student record.
router.get('/profile', authorize('student'), getProfile);
router.put('/profile', authorize('student'), profileUpdateLimiter, updateProfile);

// Featured profile toggle (Pro feature)
router.put('/featured', authorize('student'), profileUpdateLimiter, toggleFeatured);

// Profile picture upload
router.post('/profile/picture', authorize('student'), uploadLimiter, upload.single('profilePicture'), uploadProfilePicture);

export default router;
