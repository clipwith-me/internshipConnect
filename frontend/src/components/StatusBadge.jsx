// frontend/src/components/StatusBadge.jsx

import { APPLICATION_STATUS, INTERNSHIP_STATUS } from '../utils/status';

/**
 * Single source of truth for how application and listing statuses look.
 * Status is always conveyed by text + a dot, never by colour alone.
 *
 *   <StatusBadge status="under-review" />                 // application (default)
 *   <StatusBadge kind="internship" status="active" />     // listing
 */

const FALLBACK = { tone: 'bg-neutral-100 text-neutral-600', dot: 'bg-neutral-400' };

const humanize = (value = '') =>
  String(value).replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

const StatusBadge = ({ status, kind = 'application', className = '' }) => {
  if (!status) return null;
  const map = kind === 'internship' ? INTERNSHIP_STATUS : APPLICATION_STATUS;
  const cfg = map[status] || { ...FALLBACK, label: humanize(status) };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.tone} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
