// backend/src/utils/requestSafety.js
// Request-hardening helpers that complement src/utils/security.js
// (which already provides escapeRegex and validatePagination).
import crypto from 'crypto';

/**
 * Constant-time string comparison. Returns false (never throws) for
 * non-strings or values of different length.
 */
export const safeEqual = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

/**
 * Accept either "a,b,c" or ["a","b"] (what qs produces for ?skills[]=a) and
 * return a clean array of trimmed, non-empty strings. Non-string items
 * (e.g. injected objects like { $ne: 1 }) are dropped.
 */
export const toStringList = (value, maxItems = 20) => {
  const raw = Array.isArray(value) ? value : String(value ?? '').split(',');
  return raw
    .filter((v) => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, maxItems);
};

/**
 * Guard for the owner-only bulk email trigger. The secret MUST come from the
 * environment: if CAMPAIGN_SECRET is unset (or shorter than 16 characters) the
 * endpoint is disabled (fail closed) instead of falling back to a value that
 * lives in source control. The key is accepted from a header only.
 */
export const requireCampaignKey = (req, res, next) => {
  const expected = process.env.CAMPAIGN_SECRET;
  if (!expected || expected.length < 16) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  const provided = req.headers['x-campaign-key'];
  if (!safeEqual(provided, expected)) {
    return res.status(403).json({ success: false, message: 'Invalid campaign key' });
  }
  req.user = { role: 'admin' };
  return next();
};

/**
 * Decide whether a requester may download a given student's resume.
 *  - the owning student: yes
 *  - an admin: yes
 *  - an organization: only if the student has applied to one of its internships
 *  - anyone else (including the university role): no
 */
export const canAccessResume = ({ role, isOwner, hasApplicationToOrg }) => {
  if (role === 'admin') return true;
  if (role === 'student') return Boolean(isOwner);
  if (role === 'organization') return Boolean(hasApplicationToOrg);
  return false;
};
