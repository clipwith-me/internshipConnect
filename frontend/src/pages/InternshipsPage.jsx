import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Crown, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInternshipSearch } from '../hooks/useInternshipSearch';
import InternshipSearchBar from '../components/InternshipSearchBar';
import InternshipResults from '../components/InternshipResults';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';

const BASIC_KEYS = ['opportunityType', 'type', 'compensationType'];
const ADVANCED_KEYS = ['industry', 'skills', 'minSalary', 'maxSalary'];

/**
 * In-app browse page. Advanced filters (industry, skills, pay range) are
 * implemented server-side and available on paid plans; experience-level and
 * duration filters were removed because no listing data backs them.
 */
export default function InternshipsPage() {
  const { user } = useAuth();
  const plan = user?.subscription?.plan || 'free';
  const hasAdvanced = ['premium', 'pro'].includes(plan);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const search = useInternshipSearch({
    pageSize: 9,
    allowedKeys: hasAdvanced ? [...BASIC_KEYS, ...ADVANCED_KEYS] : BASIC_KEYS,
  });

  useEffect(() => {
    document.title = 'Find opportunities | InternshipConnect';
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Find opportunities" description="Internships, jobs and more. Search open roles and apply with your profile." />

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
        <InternshipSearchBar search={search} advanced={hasAdvanced && showAdvanced} />

        <div className="mt-3">
          {hasAdvanced ? (
            <button
              type="button"
              aria-expanded={showAdvanced}
              onClick={() => setShowAdvanced((v) => !v)}
              className="inline-flex items-center gap-2 rounded text-sm font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <SlidersHorizontal size={16} aria-hidden="true" />
              Advanced filters
              <ChevronDown size={16} className={showAdvanced ? 'rotate-180' : ''} aria-hidden="true" />
            </button>
          ) : (
            <p className="flex flex-wrap items-center gap-2 text-sm text-neutral-600">
              <Crown size={16} className="text-warning-600" aria-hidden="true" />
              Filter by industry, skills and pay range with a paid plan.
              <Button as={Link} to="/dashboard/pricing" variant="secondary" size="sm">View plans</Button>
            </p>
          )}
        </div>
      </div>

      <InternshipResults
        search={search}
        emptyHint="New internships are added by employers regularly. Check back soon."
      />
    </div>
  );
}
