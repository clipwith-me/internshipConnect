import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import SavedInternship from '../models/SavedInternship.js';
import Internship from '../models/Internship.js';

const router = express.Router();

// GET /api/saved-internships — get all saved internships for student
router.get('/', authenticate, async (req, res) => {
  try {
    const saved = await SavedInternship.find({ student: req.user._id })
      .populate({
        path: 'internship',
        populate: { path: 'organization', select: 'companyInfo.name companyInfo.logo verified' }
      })
      .sort({ savedAt: -1 });

    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved internships' });
  }
});

// POST /api/saved-internships — save an internship
router.post('/', authenticate, async (req, res) => {
  try {
    const { internshipId } = req.body;
    if (!internshipId) {
      return res.status(400).json({ error: 'internshipId is required' });
    }

    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    const saved = await SavedInternship.create({ student: req.user._id, internship: internshipId });
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Already saved' });
    }
    res.status(500).json({ error: 'Failed to save internship' });
  }
});

// DELETE /api/saved-internships/:internshipId — unsave
router.delete('/:internshipId', authenticate, async (req, res) => {
  try {
    const result = await SavedInternship.findOneAndDelete({
      student: req.user._id,
      internship: req.params.internshipId
    });

    if (!result) {
      return res.status(404).json({ error: 'Saved internship not found' });
    }

    res.json({ success: true, message: 'Unsaved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unsave internship' });
  }
});

export default router;
