import { BadgeCheck } from 'lucide-react';

/** Shown next to an employer whose registration document an admin has approved. */
export default function VerifiedBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium text-success-700 ${className}`}
      title="This employer's registration document was reviewed by InternshipConnect"
    >
      <BadgeCheck size={14} aria-hidden="true" />
      Verified employer
    </span>
  );
}
