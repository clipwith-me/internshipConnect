// backend/src/routes/student.routes.js

import express from 'express';
import { getProfile, updateProfile, uploadProfilePicture, upload } from '../controllers/student.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { profileUpdateLimiter, uploadLimiter } from '../middleware/security.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', profileUpdateLimiter, updateProfile);

// Profile picture upload
router.post('/profile/picture', uploadLimiter, upload.single('profilePicture'), uploadProfilePicture);

export default router;
