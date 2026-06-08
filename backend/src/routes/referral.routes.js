import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import ReferralCode from '../models/ReferralCode.js';
import Referral from '../models/Referral.js';

const router = express.Router();

// GET /api/referrals/my-code — get logged-in user's referral code
router.get('/my-code', authenticate, async (req, res) => {
  try {
    let rc = await ReferralCode.findOne({ user: req.user._id });
    if (!rc) {
      const code = 'IC-' + Math.random().toString(36).toUpperCase().slice(2, 8);
      rc = await ReferralCode.create({ user: req.user._id, code });
    }

    const totalReferrals = await Referral.countDocuments({ referrer: req.user._id });
    const completedReferrals = await Referral.countDocuments({ referrer: req.user._id, completedAt: { $ne: null } });

    res.json({
      success: true,
      data: {
        code: rc.code,
        referralUrl: `${process.env.APP_URL || 'https://internship-connect-beta.vercel.app'}/auth/register?ref=${rc.code}`,
        totalReferrals,
        completedReferrals,
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch referral data' });
  }
});

// GET /api/referrals/list — get all referrals made by user
router.get('/list', authenticate, async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user._id })
      .populate('referred', 'email createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: referrals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

export default router;
