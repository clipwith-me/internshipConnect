import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import CompanyVerification from '../models/CompanyVerification.js';
import OrganizationProfile from '../models/OrganizationProfile.js';

const router = express.Router();

// POST /api/verification/submit — company submits verification request
router.post('/submit', authenticate, authorize('organization'), async (req, res) => {
  try {
    const { documentUrl, documentName } = req.body;
    if (!documentUrl) {
      return res.status(400).json({ error: 'Document URL is required' });
    }

    const org = await OrganizationProfile.findOne({ user: req.user._id });
    if (!org) {
      return res.status(404).json({ error: 'Organization profile not found' });
    }

    const existing = await CompanyVerification.findOne({ organization: org._id });
    if (existing && existing.status === 'pending') {
      return res.status(409).json({ error: 'Verification request already pending' });
    }

    const verification = await CompanyVerification.findOneAndUpdate(
      { organization: org._id },
      { organization: org._id, submittedBy: req.user._id, documentUrl, documentName, status: 'pending', submittedAt: new Date(), adminNote: null, reviewedAt: null },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, data: verification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit verification' });
  }
});

// GET /api/verification/status — company checks own verification status
router.get('/status', authenticate, authorize('organization'), async (req, res) => {
  try {
    const org = await OrganizationProfile.findOne({ user: req.user._id });
    if (!org) return res.status(404).json({ error: 'Organization not found' });

    const verification = await CompanyVerification.findOne({ organization: org._id });
    res.json({ success: true, data: verification || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch verification status' });
  }
});

// GET /api/verification/pending — admin: list pending verifications
router.get('/pending', authenticate, authorize('admin'), async (req, res) => {
  try {
    const verifications = await CompanyVerification.find({ status: 'pending' })
      .populate('organization', 'companyInfo')
      .populate('submittedBy', 'email')
      .sort({ submittedAt: 1 });

    res.json({ success: true, data: verifications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending verifications' });
  }
});

// PATCH /api/verification/:id/review — admin approves or rejects
router.patch('/:id/review', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const verification = await CompanyVerification.findByIdAndUpdate(
      req.params.id,
      { status, adminNote, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    ).populate('organization');

    if (!verification) return res.status(404).json({ error: 'Verification not found' });

    // If approved, mark the organization as verified
    if (status === 'approved') {
      await OrganizationProfile.findByIdAndUpdate(verification.organization._id, { verified: true });
    }

    res.json({ success: true, data: verification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to review verification' });
  }
});

export default router;
