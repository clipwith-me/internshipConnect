// frontend/src/pages/DashboardPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  Plus,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { applicationAPI, internshipAPI } from '../services/api';
import { isAbortError } from '../hooks/useApi';
import { Alert, Button, EmptyState, PageHeader, StatusBadge } from '../components';
import JoinUniversityCard from '../components/JoinUniversityCard';
import { formatPlace, getOrgName } from '../utils/internship';

/* ───────────────────────── Shared pieces ───────────────────────── */

const StatTile = ({ label, value, icon: Icon, hint }) => (
  <div className="rounded-xl border border-neutral-200 bg-white p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-neutral-600">{label}</p>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
        <Icon size={18} aria-hidden="true" />
      </span>
    </div>
    <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 tabular">{value}</p>
    {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
  </div>
);

const StatSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Loading">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="h-[116px] animate-pulse rounded-xl border border-neutral-200 bg-white" />
    ))}
  </div>
);

const Panel = ({ title, action, children }) => (
  <section className="rounded-xl border border-neutral-200 bg-white">
    <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
      <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      {action}
    </div>
    <div className="p-2 sm:p-3">{children}</div>
  </section>
);

const RowLink = ({ to, title, subtitle, badge }) => (
  <Link
    to={to}
    className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
  >
    <div className="min-w-0">
      <p className="truncate font-medium text-neutral-900">{title}</p>
      {subtitle && <p className="mt-0.5 truncate text-sm text-neutral-600">{subtitle}</p>}
    </div>
    {badge}
  </Link>
);

const ViewAll = ({ to }) => (
  <Link
    to={to}
    className="inline-flex items-center gap-1 rounded text-sm font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
  >
    View all <ArrowRight size={14} aria-hidden="true" />
  </Link>
);

/* ───────────────────────── Student ───────────────────────── */

function StudentDashboard({ profile }) {
  const [state, setState] = useState({ status: 'loading', applications: [] });

  useEffect(() => {
    const controller = new AbortController();
    applicationAPI
      .getMyApplications({ signal: controller.signal })
      .then((res) => setState({ status: 'ready', applications: res.data?.data || [] }))
      .catch((err) => {
        if (!isAbortError(err)) setState({ status: 'error', applications: [] });
      });
    return () => controller.abort();
  }, []);

  const stats = useMemo(() => {
    const apps = state.applications;
    const count = (list) => apps.filter((a) => list.includes(a.status)).length;
    return {
      total: apps.length,
      inReview: count(['submitted', 'under-review']),
      progressing: count(['shortlisted', 'interview']),
      offers: count(['offered', 'accepted']),
    };
  }, [state.applications]);

  const completeness = typeof profile?.profileCompleteness === 'number' ? profile.profileCompleteness : null;

  return (
    <div className="space-y-6">
      {completeness !== null && completeness < 100 && (
        <Alert variant="info" title={`Your profile is ${completeness}% complete`}>
          A complete profile helps employers understand your background and improves your match scores.{' '}
          <Link to="/dashboard/profile" className="font-semibold underline">Complete your profile</Link>
        </Alert>
      )}

      {state.status === 'loading' && <StatSkeleton />}
      {state.status === 'error' && (
        <Alert variant="error" title="We couldn't load your applications">
          Please refresh the page to try again.
        </Alert>
      )}

      {state.status === 'ready' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Applications" value={stats.total} icon={FileText} />
            <StatTile label="In review" value={stats.inReview} icon={Clock} hint="Submitted or under review" />
            <StatTile label="Moving forward" value={stats.progressing} icon={Users} hint="Shortlisted or interviewing" />
            <StatTile label="Offers" value={stats.offers} icon={CheckCircle2} />
          </div>

          <Panel title="Recent applications" action={state.applications.length > 0 && <ViewAll to="/dashboard/applications" />}>
            {state.applications.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="You haven't applied to anything yet"
                description="Browse open internships and apply in a few clicks. Your applications will appear here."
                action={<Button as={Link} to="/dashboard/internships">Browse internships</Button>}
                className="border-0"
              />
            ) : (
              <div className="divide-y divide-neutral-100">
                {state.applications.slice(0, 5).map((a) => (
                  <RowLink
                    key={a._id}
                    to={a.internship?._id ? `/dashboard/internships/${a.internship._id}` : '/dashboard/applications'}
                    title={a.internship?.title || 'Internship no longer available'}
                    subtitle={getOrgName(a.internship) || undefined}
                    badge={<StatusBadge status={a.status} />}
                  />
                ))}
              </div>
            )}
          </Panel>
        </>
      )}

      <JoinUniversityCard />
    </div>
  );
}

/* ───────────────────────── Employer ───────────────────────── */

function OrganizationDashboard() {
  const [state, setState] = useState({ status: 'loading', internships: [], totalApplications: 0, awaiting: 0 });

  useEffect(() => {
    const controller = new AbortController();
    const config = { signal: controller.signal };
    Promise.all([
      internshipAPI.getMyInternships(config),
      applicationAPI.getOrganizationApplications({ limit: 1 }),
      applicationAPI.getOrganizationApplications({ limit: 1, status: 'submitted' }),
    ])
      .then(([mine, all, awaiting]) =>
        setState({
          status: 'ready',
          internships: mine.data?.data || [],
          totalApplications: all.data?.pagination?.total ?? 0,
          awaiting: awaiting.data?.pagination?.total ?? 0,
        })
      )
      .catch((err) => {
        if (!isAbortError(err)) setState((s) => ({ ...s, status: 'error' }));
      });
    return () => controller.abort();
  }, []);

  const { internships } = state;
  const active = internships.filter((i) => i.status === 'active').length;

  return (
    <div className="space-y-6">
      {state.status === 'loading' && <StatSkeleton />}
      {state.status === 'error' && (
        <Alert variant="error" title="We couldn't load your dashboard">Please refresh the page to try again.</Alert>
      )}

      {state.status === 'ready' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Open listings" value={active} icon={Briefcase} hint="Currently accepting applications" />
            <StatTile label="All listings" value={internships.length} icon={FileText} hint="Including drafts and closed" />
            <StatTile label="Applications received" value={state.totalApplications} icon={Inbox} />
            <StatTile label="Awaiting review" value={state.awaiting} icon={Clock} hint="Not yet reviewed" />
          </div>

          {state.awaiting > 0 && (
            <Alert variant="info" title={`${state.awaiting} ${state.awaiting === 1 ? 'application is' : 'applications are'} waiting for your review`}>
              <Link to="/dashboard/applications" className="font-semibold underline">Review applications</Link>
            </Alert>
          )}

          <Panel title="Your internships" action={internships.length > 0 && <ViewAll to="/dashboard/my-internships" />}>
            {internships.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="You haven't posted an internship yet"
                description="Publish your first listing to start receiving applications from students."
                action={<Button as={Link} to="/dashboard/internships/create" icon={<Plus size={16} aria-hidden="true" />}>Post an internship</Button>}
                className="border-0"
              />
            ) : (
              <div className="divide-y divide-neutral-100">
                {internships.slice(0, 5).map((i) => (
                  <RowLink
                    key={i._id}
                    to={`/dashboard/internships/${i._id}`}
                    title={i.title}
                    subtitle={[formatPlace(i), `${i.statistics?.applications ?? 0} applications`].filter(Boolean).join(' · ')}
                    badge={<StatusBadge kind="internship" status={i.status} />}
                  />
                ))}
              </div>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}

/* ───────────────────────── Page ───────────────────────── */

const DashboardPage = () => {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    document.title = 'Dashboard | InternshipConnect';
  }, []);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center py-16" role="status" aria-label="Loading">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent motion-reduce:animate-none" />
      </div>
    );
  }

  // Roles with their own home are redirected declaratively (no hooks after a return).
  if (user.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
  if (user.role === 'university') return <Navigate to="/dashboard/university" replace />;

  const isStudent = user.role === 'student';
  const isOrganization = user.role === 'organization';
  if (!isStudent && !isOrganization) {
    return (
      <Alert variant="error" title="Account type not recognised">
        Your account has an unexpected role. Please contact support.
      </Alert>
    );
  }

  const name = isStudent
    ? profile?.personalInfo?.firstName
    : profile?.companyInfo?.name;

  return (
    <>
      <PageHeader
        title={name ? `Welcome back, ${name}` : 'Welcome back'}
        description={
          isStudent
            ? 'Track your applications and find new opportunities.'
            : 'Manage your internship listings and review applicants.'
        }
        actions={
          isStudent ? (
            <Button as={Link} to="/dashboard/internships">Browse internships</Button>
          ) : (
            <Button as={Link} to="/dashboard/internships/create" icon={<Plus size={16} aria-hidden="true" />}>
              Post an internship
            </Button>
          )
        }
      />
      {isStudent ? <StudentDashboard profile={profile} /> : <OrganizationDashboard />}
    </>
  );
};

export default DashboardPage;
