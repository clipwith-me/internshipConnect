import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Wallet, Laptop } from 'lucide-react';
import {
  formatCompensation,
  formatPlace,
  getArrangement,
  getDeadline,
  getOrgLogo,
  getOrgName,
  initials,
} from '../utils/internship';

/**
 * One internship in a list. Shows only fields that exist on the record.
 * `to` is the detail destination (defaults to the in-app detail route, which
 * sends signed-out visitors through login and back).
 */
export default function InternshipCard({ internship, to, className = '' }) {
  const org = getOrgName(internship);
  const [logoFailed, setLogoFailed] = useState(false);
  const logo = logoFailed ? null : getOrgLogo(internship);
  const place = formatPlace(internship);
  const arrangement = getArrangement(internship);
  const pay = formatCompensation(internship);
  const deadline = getDeadline(internship);
  const href = to || `/dashboard/internships/${internship._id}`;

  return (
    <article
      className={`group relative flex flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-primary-500 ${className}`}
    >
      <div className="flex items-center gap-3">
        {logo ? (
          <img
            src={logo}
            alt=""
            className="h-10 w-10 rounded-lg border border-neutral-200 object-cover"
            loading="lazy"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-sm font-semibold text-primary-700"
            aria-hidden="true"
          >
            {initials(org || internship.title)}
          </div>
        )}
        <p className="min-w-0 truncate text-sm font-medium text-neutral-600">{org || 'Employer'}</p>
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug text-neutral-900">
        {/* The whole card is the click target; the link sits on the title for a11y */}
        <Link
          to={href}
          className="after:absolute after:inset-0 after:content-[''] focus:outline-none"
        >
          {internship.title}
        </Link>
      </h3>

      <ul className="mt-3 space-y-1.5 text-sm text-neutral-600">
        {(place || arrangement) && (
          <li className="flex items-center gap-2">
            {arrangement === 'Remote' ? (
              <Laptop size={15} className="shrink-0 text-neutral-400" aria-hidden="true" />
            ) : (
              <MapPin size={15} className="shrink-0 text-neutral-400" aria-hidden="true" />
            )}
            <span>{[place, arrangement].filter(Boolean).join(' · ')}</span>
          </li>
        )}
        {pay && (
          <li className="flex items-center gap-2">
            <Wallet size={15} className="shrink-0 text-neutral-400" aria-hidden="true" />
            <span>{pay}</span>
          </li>
        )}
      </ul>

      {deadline && (
        <p
          className={`mt-4 flex items-center gap-1.5 border-t border-neutral-100 pt-3 text-xs font-medium ${
            deadline.passed ? 'text-neutral-500' : deadline.urgent ? 'text-warning-700' : 'text-neutral-600'
          }`}
        >
          <Clock size={14} aria-hidden="true" />
          {deadline.label}
        </p>
      )}
    </article>
  );
}
