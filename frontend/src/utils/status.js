// frontend/src/utils/status.js
// Labels and colour tokens for application and listing statuses (single source of truth).

export const APPLICATION_STATUS = {
  submitted: { label: 'Submitted', tone: 'bg-primary-50 text-primary-700', dot: 'bg-primary-500' },
  'under-review': { label: 'Under review', tone: 'bg-neutral-100 text-neutral-700', dot: 'bg-neutral-500' },
  shortlisted: { label: 'Shortlisted', tone: 'bg-primary-100 text-primary-800', dot: 'bg-primary-600' },
  interview: { label: 'Interview', tone: 'bg-warning-100 text-warning-700', dot: 'bg-warning-500' },
  offered: { label: 'Offer made', tone: 'bg-success-100 text-success-700', dot: 'bg-success-500' },
  accepted: { label: 'Accepted', tone: 'bg-success-100 text-success-700', dot: 'bg-success-500' },
  rejected: { label: 'Not selected', tone: 'bg-error-100 text-error-700', dot: 'bg-error-500' },
  withdrawn: { label: 'Withdrawn', tone: 'bg-neutral-100 text-neutral-600', dot: 'bg-neutral-400' },
};

export const INTERNSHIP_STATUS = {
  draft: { label: 'Draft', tone: 'bg-neutral-100 text-neutral-700', dot: 'bg-neutral-400' },
  active: { label: 'Open', tone: 'bg-success-100 text-success-700', dot: 'bg-success-500' },
  paused: { label: 'Paused', tone: 'bg-warning-100 text-warning-700', dot: 'bg-warning-500' },
  closed: { label: 'Closed', tone: 'bg-neutral-100 text-neutral-600', dot: 'bg-neutral-400' },
  filled: { label: 'Filled', tone: 'bg-primary-100 text-primary-800', dot: 'bg-primary-600' },
  expired: { label: 'Expired', tone: 'bg-neutral-100 text-neutral-600', dot: 'bg-neutral-400' },
};

const PIPELINE = ['submitted', 'under-review', 'shortlisted', 'interview', 'offered', 'accepted'];

/**
 * Statuses an employer may move an application to. Mirrors the server rule
 * (backend utils/requestSafety.js canTransitionApplication); the server remains
 * the authority and rejects anything else with 409.
 */
export const nextApplicationStatuses = (current) => {
  const i = PIPELINE.indexOf(current);
  if (i === -1 || current === 'accepted') return [];
  const forward = PIPELINE.slice(i + 1).filter((s) => s !== 'accepted' || current === 'offered');
  return [...forward, 'rejected'];
};
