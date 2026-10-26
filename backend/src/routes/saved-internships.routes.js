import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import SavedInternship from '../models/SavedInternship.js';
import Internship from '../models/Internship.js';
import { withPublicVerification } from '../utils/orgVerification.js';

const router = express.Router();

// GET /api/saved-internships — get all saved internships for student
router.get('/', authenticate, authorize('student'), async (req, res) => {
  try {
    const saved = await SavedInternship.find({ student: req.user._id })
      .populate({
        path: 'internship',
        populate: { path: 'organization', select: 'companyInfo.name companyInfo.logo verification.status verification.verifiedBy' }
      })
      .sort({ savedAt: -1 });

    res.json({
      success: true,
      data: saved.map((s) => {
        const json = s.toJSON();
        if (s.internship) json.internship = withPublicVerification(s.internship);
        return json;
      })
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved internships' });
  }
});

// POST /api/saved-internships — save an internship
router.post('/', authenticate, authorize('student'), async (req, res) => {
  try {
    const { internshipId } = req.body;
    if (!internshipId) {
      return res.status(400).json({ error: 'internshipId is required' });
    }

    const internship = await Internship.findById(internshipId);
    // Drafts and private listings are not visible to students, so they can't be saved.
    if (!internship || internship.status === 'draft' || internship.visibility === 'private') {
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
router.delete('/:internshipId', authenticate, authorize('student'), async (req, res) => {
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
