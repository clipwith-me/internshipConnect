// frontend/src/utils/internship.js
// Presentation helpers for internship listings. They only ever return values
// that exist on the record; callers hide a field when the helper returns null.
import { differenceInCalendarDays, format, isValid } from 'date-fns';

const ARRANGEMENT_LABELS = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' };

export const getOrgName = (internship) => internship?.organization?.companyInfo?.name || null;

export const getOrgLogo = (internship) => internship?.organization?.companyInfo?.logo?.url || null;

export const getArrangement = (internship) =>
  ARRANGEMENT_LABELS[internship?.location?.type] || null;

/** "Lagos, Nigeria" (city/country that exist), or null when neither is set. */
export const formatPlace = (internship) => {
  const { city, country } = internship?.location || {};
  const place = [city, country].filter(Boolean).join(', ');
  return place || null;
};

const COMPENSATION_LABELS = {
  paid: 'Paid',
  stipend: 'Stipend',
  commission: 'Commission',
  unpaid: 'Unpaid',
  negotiable: 'Compensation negotiable',
};

const number = (n) => new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format(n);

/** "Paid · USD 150–300 / month", "Unpaid", or null if there is no compensation data. */
export const formatCompensation = (internship) => {
  const c = internship?.compensation;
  if (!c?.type) return null;
  const label = COMPENSATION_LABELS[c.type] || null;
  if (!label) return null;
  if (c.type === 'unpaid' || c.type === 'negotiable') return label;

  const { min, max, currency = 'USD', period } = c.amount || {};
  const hasMin = typeof min === 'number' && min > 0;
  const hasMax = typeof max === 'number' && max > 0;
  if (!hasMin && !hasMax) return label;

  const range =
    hasMin && hasMax && min !== max ? `${number(min)}–${number(max)}` : number(hasMax ? max : min);
  return `${label} · ${currency} ${range}${period && period !== 'total' ? ` / ${period.replace('ly', '')}` : ''}`;
};

/**
 * Application deadline as { label, urgent, passed } or null.
 * `urgent` = closing within 7 days.
 */
export const getDeadline = (internship) => {
  const raw = internship?.timeline?.applicationDeadline;
  if (!raw) return null;
  const date = new Date(raw);
  if (!isValid(date)) return null;
  const days = differenceInCalendarDays(date, new Date());
  if (days < 0) return { label: `Closed ${format(date, 'd MMM yyyy')}`, urgent: false, passed: true };
  if (days === 0) return { label: 'Closes today', urgent: true, passed: false };
  if (days === 1) return { label: 'Closes tomorrow', urgent: true, passed: false };
  if (days <= 7) return { label: `Closes in ${days} days`, urgent: true, passed: false };
  return { label: `Apply by ${format(date, 'd MMM yyyy')}`, urgent: false, passed: false };
};

/** First letter(s) for a logo placeholder. */
export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?';
