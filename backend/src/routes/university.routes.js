// backend/src/routes/university.routes.js
import express from 'express';
import {
  listUniversities,
  getMyUniversity,
  updateMyUniversity,
  getDashboard,
  getStudents,
  joinUniversity,
  leaveUniversity,
} from '../controllers/university.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public: directory for the student "join your university" selector.
router.get('/', listUniversities);

// Student: affiliate with / leave a university.
router.post('/join', authenticate, authorize('student'), joinUniversity);
router.post('/leave', authenticate, authorize('student'), leaveUniversity);

// University coordinator: own profile, dashboard, roster.
router.get('/me', authenticate, authorize('university'), getMyUniversity);
router.put('/me', authenticate, authorize('university'), updateMyUniversity);
router.get('/me/dashboard', authenticate, authorize('university'), getDashboard);
router.get('/me/students', authenticate, authorize('university'), getStudents);

export default router;
