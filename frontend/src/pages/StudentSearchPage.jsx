import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, ChevronRight, MapPin, Search, SearchX, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../services/api';
import { isAbortError } from '../hooks/useApi';
import { useDebounce } from '../hooks/useDebounce';
import { Button, EmptyState, FeaturedBadge, PageHeader } from '../components';

const DEGREES = [
  ['', 'Any education level'],
  ['bachelor', "Bachelor's"],
  ['master', "Master's"],
  ['phd', 'PhD'],
  ['associate', 'Associate'],
  ['bootcamp', 'Bootcamp'],
  ['certificate', 'Certificate'],
];

const input =
  'h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-500 hover:border-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/30';

const label = (v) => (v ? v.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()) : '');

export default function StudentSearchPage() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [education, setEducation] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ status: 'loading', items: [], pagination: null });
  const [retry, setRetry] = useState(0);

  const dq = useDebounce(q.trim(), 350);
  const dSkills = useDebounce(skills.trim(), 350);
  const dLocation = useDebounce(location.trim(), 350);

  useEffect(() => {
    document.title = 'Find students | InternshipConnect';
  }, []);

  // Any filter change returns to the first page.
  useEffect(() => setPage(1), [dq, dSkills, dLocation, education]);

  useEffect(() => {
    if (user?.role !== 'organization') return undefined;
    const controller = new AbortController();
    setState((s) => ({ ...s, status: 'loading' }));
    studentAPI
      .search(
        { page, limit: 12, search: dq, skills: dSkills, location: dLocation, education },
        { signal: controller.signal }
      )
      .then((res) =>
        setState({ status: 'ready', items: res.data?.data?.students || [], pagination: res.data?.data?.pagination || null })
      )
      .catch((err) => {
        if (!isAbortError(err)) setState({ status: 'error', items: [], pagination: null });
      });
    return () => controller.abort();
  }, [user?.role, page, dq, dSkills, dLocation, education, retry]);

  if (user && user.role !== 'organization') return <Navigate to="/dashboard" replace />;

  const total = state.pagination?.totalStudents ?? 0;
  const pages = state.pagination?.total ?? 1;
  const hasFilters = Boolean(q || skills || location || education);
  const clear = () => {
    setQ(''); setSkills(''); setLocation(''); setEducation('');
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Find students" description="Browse public student profiles. Contact details are shared only when a student applies to you." />

      <form role="search" aria-label="Search students" onSubmit={(e) => e.preventDefault()} className="mb-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <label htmlFor="s-q" className="sr-only">Name or keyword</label>
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
            <input id="s-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, headline or bio" className={`${input} pl-10`} />
          </div>
          <div className="md:col-span-3">
            <label htmlFor="s-skills" className="sr-only">Skills</label>
            <input id="s-skills" type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills, e.g. Python, SQL" className={input} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="s-loc" className="sr-only">Location</label>
            <input id="s-loc" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or country" className={input} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="s-edu" className="sr-only">Education level</label>
            <select id="s-edu" value={education} onChange={(e) => setEducation(e.target.value)} className={input}>
              {DEGREES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
      </form>

      <div className="mb-4 flex min-h-[2rem] items-center justify-between gap-3">
        <p className="text-sm font-medium text-neutral-700" role="status" aria-live="polite">
          {state.status === 'loading' ? 'Searching…' : state.status === 'ready' ? `${total} ${total === 1 ? 'student' : 'students'} found` : ''}
        </p>
        {hasFilters && (
          <button type="button" onClick={clear} className="rounded text-sm font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
            Clear filters
          </button>
        )}
      </div>

      {state.status === 'loading' && (
        <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
          {[0, 1, 2, 3].map((n) => <div key={n} className="h-44 animate-pulse rounded-xl border border-neutral-200 bg-white" />)}
        </div>
      )}

      {state.status === 'error' && (
        <EmptyState icon={SearchX} title="We couldn't search students" description="Please check your connection and try again." action={<Button variant="secondary" onClick={() => setRetry((n) => n + 1)}>Try again</Button>} />
      )}

      {state.status === 'ready' && state.items.length === 0 && (
        <EmptyState
          icon={SearchX}
          title={hasFilters ? 'No students match those filters' : 'No public student profiles yet'}
          description={hasFilters ? 'Try fewer filters or a broader keyword.' : 'Students appear here when they make their profile public.'}
          action={hasFilters ? <Button variant="secondary" onClick={clear}>Clear filters</Button> : undefined}
        />
      )}

      {state.status === 'ready' && state.items.length > 0 && (
        <>
          <ul className="grid gap-4 md:grid-cols-2">
            {state.items.map((s) => {
              const p = s.personalInfo || {};
              const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Student';
              const place = [p.location?.city, p.location?.country].filter(Boolean).join(', ');
              const edu = s.education?.[0];
              return (
                <li key={s._id} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    {p.profilePicture?.url ? (
                      <img src={p.profilePicture.url} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" loading="lazy" />
                    ) : (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700" aria-hidden="true"><User size={24} /></span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-neutral-900">{name}</h2>
                        {s.featured?.isFeatured && <FeaturedBadge variant="default" size="sm" />}
                      </div>
                      {s.headline && <p className="mt-0.5 text-sm text-neutral-700">{s.headline}</p>}
                      {place && <p className="mt-1 flex items-center gap-1 text-xs text-neutral-600"><MapPin size={13} aria-hidden="true" />{place}</p>}
                    </div>
                    <p className="shrink-0 text-right text-xs text-neutral-600">
                      Profile<br /><span className="text-base font-semibold text-neutral-900 tabular">{s.profileCompleteness ?? 0}%</span>
                    </p>
                  </div>

                  {s.bio && <p className="mt-3 line-clamp-2 text-sm text-neutral-700">{s.bio}</p>}

                  {s.skills?.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Skills">
                      {s.skills.slice(0, 6).map((k, i) => <li key={i} className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-700">{k.name}</li>)}
                      {s.skills.length > 6 && <li className="px-1 py-0.5 text-xs text-neutral-600">+{s.skills.length - 6} more</li>}
                    </ul>
                  )}

                  {edu?.institution && (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-neutral-600">
                      <BookOpen size={14} aria-hidden="true" />
                      {[edu.institution, label(edu.degree), edu.major].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>

          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} icon={<ChevronLeft size={16} aria-hidden="true" />}>Previous</Button>
              <span className="text-sm text-neutral-600 tabular">Page {page} of {pages}</span>
              <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)} icon={<ChevronRight size={16} aria-hidden="true" />} iconPosition="right">Next</Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
