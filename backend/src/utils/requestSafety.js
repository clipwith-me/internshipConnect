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

// Hiring pipeline, in order. 'rejected' can be reached from any open stage;
// 'withdrawn' is a student-only outcome and is never set by an employer.
const PIPELINE = ['submitted', 'under-review', 'shortlisted', 'interview', 'offered', 'accepted'];
const TERMINAL = ['accepted', 'rejected', 'withdrawn'];

/**
 * Can an employer move an application from `current` to `next`?
 *
 *  - closed applications (accepted / rejected / withdrawn) cannot change
 *  - rejecting is allowed from any open stage
 *  - otherwise only forward moves are allowed (skipping a stage is fine)
 *  - 'accepted' requires a prior offer, so placements can't be recorded
 *    for someone who was never offered the role
 *
 * Returns { ok: true } or { ok: false, reason }.
 */
export const canTransitionApplication = (current, next) => {
  if (!PIPELINE.includes(current) && current !== 'rejected' && current !== 'withdrawn') {
    return { ok: false, reason: 'Unknown current status' };
  }
  if (TERMINAL.includes(current)) {
    return { ok: false, reason: `This application is already ${current} and can no longer be changed` };
  }
  if (next === current) {
    return { ok: false, reason: 'The application already has this status' };
  }
  if (next === 'withdrawn') {
    return { ok: false, reason: 'Only the applicant can withdraw an application' };
  }
  if (next === 'rejected') return { ok: true };
  if (!PIPELINE.includes(next)) {
    return { ok: false, reason: 'Invalid status' };
  }
  if (PIPELINE.indexOf(next) < PIPELINE.indexOf(current)) {
    return { ok: false, reason: 'An application cannot move back to an earlier stage' };
  }
  if (next === 'accepted' && current !== 'offered') {
    return { ok: false, reason: 'Make an offer before marking an application as accepted' };
  }
  return { ok: true };
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
