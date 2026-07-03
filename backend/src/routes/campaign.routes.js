// backend/src/routes/campaign.routes.js
// Protected by a shared secret — no admin role required.
// This lets the platform owner trigger bulk email sends without
// needing a promoted admin account in the database.

import express from 'express';
import { sendCampaignEmails } from '../controllers/admin.controller.js';

const router = express.Router();

const CAMPAIGN_SECRET = process.env.CAMPAIGN_SECRET || 'ic-campaign-2025';

router.post('/send', (req, res, next) => {
  const key = req.headers['x-campaign-key'] || req.body?.campaignKey;
  if (key !== CAMPAIGN_SECRET) {
    return res.status(403).json({ success: false, message: 'Invalid campaign key' });
  }
  // Attach a fake req.user so sendCampaignEmails doesn't crash on role checks
  req.user = { role: 'admin' };
  next();
}, sendCampaignEmails);

export default router;
