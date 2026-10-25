import { MapPin, Search } from 'lucide-react';
import { OPPORTUNITY_TYPES } from '../utils/opportunity';

const ARRANGEMENTS = [
  { value: '', label: 'Any arrangement' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
];

const COMPENSATION = [
  { value: '', label: 'Any compensation' },
  { value: 'paid', label: 'Paid' },
  { value: 'stipend', label: 'Stipend' },
  { value: 'unpaid', label: 'Unpaid' },
];

const INDUSTRIES = [
  'technology', 'finance', 'healthcare', 'education', 'retail',
  'manufacturing', 'media', 'agriculture', 'other',
];

const field =
  'h-11 w-full rounded-md border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-500 hover:border-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/30';

/**
 * Keyword + city + arrangement + compensation, with an optional row of advanced
 * filters (industry, skills, pay range) that really are implemented server-side.
 */
export default function InternshipSearchBar({ search, advanced = false }) {
  const { searchInput, setSearchInput, locationInput, setLocationInput, filters, setFilter } = search;

  return (
    <form role="search" aria-label="Search opportunities" onSubmit={(e) => e.preventDefault()} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-12">
        <div className="md:col-span-12 lg:col-span-12">
          <label htmlFor="otype" className="sr-only">Type of opportunity</label>
          <select id="otype" value={filters.opportunityType} onChange={(e) => setFilter('opportunityType', e.target.value)} className={`${field} px-3 sm:max-w-xs`}>
            <option value="">All opportunities</option>
            {OPPORTUNITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="relative md:col-span-5">
          <label htmlFor="q" className="sr-only">Keyword</label>
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
          <input id="q" type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Role, skill or keyword" className={`${field} pl-10 pr-3`} />
        </div>
        <div className="relative md:col-span-3">
          <label htmlFor="loc" className="sr-only">City</label>
          <MapPin size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
          <input id="loc" type="text" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} placeholder="City" className={`${field} pl-10 pr-3`} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="type" className="sr-only">Work arrangement</label>
          <select id="type" value={filters.type} onChange={(e) => setFilter('type', e.target.value)} className={`${field} px-3`}>
            {ARRANGEMENTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="comp" className="sr-only">Compensation</label>
          <select id="comp" value={filters.compensationType} onChange={(e) => setFilter('compensationType', e.target.value)} className={`${field} px-3`}>
            {COMPENSATION.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {advanced && (
        <div className="grid gap-3 border-t border-neutral-200 pt-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="industry" className="mb-1 block text-xs font-medium text-neutral-600">Employer industry</label>
            <select id="industry" value={filters.industry} onChange={(e) => setFilter('industry', e.target.value)} className={`${field} px-3`}>
              <option value="">Any industry</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="skills" className="mb-1 block text-xs font-medium text-neutral-600">Required skills</label>
            <input id="skills" type="text" value={filters.skills} onChange={(e) => setFilter('skills', e.target.value)} placeholder="e.g. React, Python" className={`${field} px-3`} />
          </div>
          <div>
            <label htmlFor="minPay" className="mb-1 block text-xs font-medium text-neutral-600">Minimum pay / month</label>
            <input id="minPay" type="number" min="0" inputMode="numeric" value={filters.minSalary} onChange={(e) => setFilter('minSalary', e.target.value)} placeholder="e.g. 100" className={`${field} px-3`} />
          </div>
          <div>
            <label htmlFor="maxPay" className="mb-1 block text-xs font-medium text-neutral-600">Maximum pay / month</label>
            <input id="maxPay" type="number" min="0" inputMode="numeric" value={filters.maxSalary} onChange={(e) => setFilter('maxSalary', e.target.value)} placeholder="e.g. 500" className={`${field} px-3`} />
          </div>
        </div>
      )}
    </form>
  );
}
