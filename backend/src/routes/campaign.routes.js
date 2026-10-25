// backend/src/routes/campaign.routes.js
// Owner-only bulk email trigger, protected by a shared secret read from the
// CAMPAIGN_SECRET environment variable (min. 16 chars). If the variable is not
// set the endpoint responds 404, so there is no default credential to guess or
// leak from source control. Remove this route entirely once no longer needed.

import express from 'express';
import { sendCampaignEmails } from '../controllers/admin.controller.js';
import { requireCampaignKey } from '../utils/requestSafety.js';

const router = express.Router();

router.post('/send', requireCampaignKey, sendCampaignEmails);

export default router;
