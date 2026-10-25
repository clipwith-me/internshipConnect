// backend/src/routes/organization.routes.js

import express from 'express';
import { getProfile, updateProfile, uploadLogo, uploadCoverImage, upload } from '../controllers/organization.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { profileUpdateLimiter, uploadLimiter } from '../middleware/security.middleware.js';

const router = express.Router();

// All routes require an authenticated organization account (admins pass through
// authorize). The handlers lazily create an OrganizationProfile, so this guard
// stops other roles from generating stray organization records.
router.use(authenticate);
router.use(authorize('organization'));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', profileUpdateLimiter, updateProfile);

// Image upload routes
router.post('/profile/logo', uploadLimiter, upload.single('logo'), uploadLogo);
router.post('/profile/cover-image', uploadLimiter, upload.single('coverImage'), uploadCoverImage);

export default router;
