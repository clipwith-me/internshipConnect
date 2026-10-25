import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Bookmark,
  Building2,
  Check,
  ClipboardList,
  FileText,
  GraduationCap,
  Search,
  Send,
  SlidersHorizontal,
  Target,
  Users,
} from 'lucide-react';
import { internshipAPI } from '../services/api';
import { useApi, isAbortError } from '../hooks/useApi';
import { Button, EmptyState } from '../components';
import InternshipCard from '../components/InternshipCard';

/* ───────────────────────── Hero ───────────────────────── */

const PIPELINE = ['Submitted', 'Under review', 'Shortlisted', 'Interview', 'Offer'];

function PipelineVisual() {
  // An illustration of the real application statuses, not live or sample data.
  const current = 2;
  return (
    <figure className="relative mx-auto w-full max-w-md" aria-label="Illustration: the stages an application moves through">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary-100 via-white to-success-100 opacity-70 blur-2xl" aria-hidden="true" />
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Application progress</p>
        <p className="mt-1 text-lg font-semibold text-neutral-900">Know where you stand, always</p>
        <ol className="mt-6 space-y-0">
          {PIPELINE.map((step, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={step} className="relative flex items-center gap-4 pb-6 last:pb-0">
                {i < PIPELINE.length - 1 && (
                  <span
                    className={`absolute left-[15px] top-8 h-[calc(100%-1.25rem)] w-px ${done ? 'bg-primary-500' : 'bg-neutral-200'}`}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                    done
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : active
                      ? 'border-primary-500 bg-white text-primary-600 ring-4 ring-primary-100'
                      : 'border-neutral-300 bg-white text-neutral-500'
                  }`}
                >
                  {done ? <Check size={16} aria-hidden="true" /> : i + 1}
                </span>
                <span className={`text-sm ${active ? 'font-semibold text-neutral-900' : done ? 'font-medium text-neutral-700' : 'text-neutral-500'}`}>
                  {step}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <figcaption className="mt-3 text-center text-xs text-neutral-500">
        Employers update each application; you are notified as it moves.
      </figcaption>
    </figure>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/70 to-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-3 py-1 text-xs font-semibold text-primary-700">
            <span className="h-1.5 w-1.5 rounded-full bg-success-500" aria-hidden="true" />
            Free for students &middot; Free to start for employers
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl">
            Your first internship
            <span className="block text-primary-600">starts here.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-neutral-600">
            InternshipConnect is where students find internships and apply in one place, and where employers
            reach motivated early-career talent.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button as={Link} to="/internships" size="lg" icon={<ArrowRight size={18} aria-hidden="true" />} iconPosition="right">
              Browse internships
            </Button>
            <Button as={Link} to="/auth/register?role=organization" size="lg" variant="secondary">
              Post an internship
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-600">
            {['Track every application', 'Match scores based on your profile', 'One dashboard for employers'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check size={16} className="text-success-600" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <PipelineVisual />
      </div>
    </section>
  );
}

/* ───────────────────────── Open internships (live data) ───────────────────────── */

function OpenInternships() {
  const abortController = useApi();
  const [state, setState] = useState({ status: 'loading', items: [], total: 0 });

  useEffect(() => {
    let active = true;
    internshipAPI
      .getAll({ limit: 3 }, { signal: abortController.signal })
      .then((res) => {
        if (!active) return;
        const data = res.data?.data;
        const items = data?.internships || [];
        setState({ status: 'ready', items, total: data?.pagination?.totalItems ?? items.length });
      })
      .catch((err) => {
        if (!active || isAbortError(err)) return;
        setState({ status: 'error', items: [], total: 0 });
      });
    return () => {
      active = false;
    };
  }, [abortController]);

  return (
    <section className="border-y border-neutral-200 bg-white" aria-labelledby="open-heading">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="open-heading" className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              Open internships
            </h2>
            <p className="mt-2 text-neutral-600">
              {state.status === 'ready' && state.total > 0
                ? `${state.total} ${state.total === 1 ? 'internship is' : 'internships are'} open for applications right now.`
                : 'Listings posted by employers appear here as soon as they go live.'}
            </p>
          </div>
          <Link
            to="/internships"
            className="inline-flex items-center gap-1.5 rounded text-sm font-semibold text-primary-600 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            See all internships <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8">
          {state.status === 'loading' && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading internships">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-44 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100" />
              ))}
            </div>
          )}

          {state.status === 'ready' && state.items.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {state.items.map((item) => (
                <InternshipCard key={item._id} internship={item} />
              ))}
            </div>
          )}

          {state.status === 'ready' && state.items.length === 0 && (
            <EmptyState
              icon={Search}
              title="No internships are open at the moment"
              description="Create a free profile now so you're ready to apply the moment new roles are posted."
              action={
                <Button as={Link} to="/auth/register">
                  Create a free profile
                </Button>
              }
            />
          )}

          {state.status === 'error' && (
            <EmptyState
              icon={Search}
              title="We couldn't load internships just now"
              description="Please check your connection and try again in a moment."
              action={
                <Button variant="secondary" onClick={() => window.location.reload()}>
                  Reload
                </Button>
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── How it works ───────────────────────── */

const STUDENT_STEPS = [
  { icon: GraduationCap, title: 'Build your profile', body: 'Add your education, skills and resume once. Employers see a complete picture of you.' },
  { icon: Search, title: 'Find the right fit', body: 'Search by keyword, location and work arrangement, and see how well each role matches your profile.' },
  { icon: Send, title: 'Apply and follow up', body: 'Apply in a few clicks, then track the status of every application from your dashboard.' },
];

const EMPLOYER_STEPS = [
  { icon: ClipboardList, title: 'Post an internship', body: 'Describe the role, compensation and deadline. Save it as a draft or publish when ready.' },
  { icon: Users, title: 'Review applicants', body: 'See every applicant, their profile and resume, in one place instead of scattered inboxes.' },
  { icon: Target, title: 'Move candidates forward', body: 'Shortlist, schedule interviews and make offers. Students are notified at each step.' },
];

function Steps({ id, eyebrow, title, steps, cta }) {
  return (
    <div>
      <p className="text-sm font-semibold text-primary-600">{eyebrow}</p>
      <h3 id={id} className="mt-1 text-xl font-semibold text-neutral-900">{title}</h3>
      <ol className="mt-6 space-y-6">
        {steps.map(({ icon: Icon, title: t, body }, i) => (
          <li key={t} className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <Icon size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-neutral-900">
                <span className="mr-1.5 text-neutral-500 tabular">{i + 1}.</span>
                {t}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">{body}</p>
            </div>
          </li>
        ))}
      </ol>
      {cta}
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-neutral-50" aria-labelledby="how-heading">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <h2 id="how-heading" className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            How InternshipConnect works
          </h2>
          <p className="mt-3 text-neutral-600">One platform, two sides, one clear process.</p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
            <Steps
              eyebrow="For students"
              title="From profile to application"
              steps={STUDENT_STEPS}
              cta={
                <Button as={Link} to="/auth/register" className="mt-8" variant="outline">
                  Create a free profile
                </Button>
              }
            />
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
            <Steps
              eyebrow="For employers"
              title="From listing to offer"
              steps={EMPLOYER_STEPS}
              cta={
                <Button as={Link} to="/auth/register?role=organization" className="mt-8" variant="outline">
                  Post your first internship
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Product features ───────────────────────── */

const FEATURES = [
  { icon: SlidersHorizontal, title: 'Search that narrows quickly', body: 'Filter by keyword, location, work arrangement and compensation type.' },
  { icon: Target, title: 'Match scores', body: 'See how a role lines up with your skills, education, location and interests before you apply.' },
  { icon: ClipboardList, title: 'Application tracking', body: 'Every application and its current status in a single list.' },
  { icon: FileText, title: 'Resume tools', body: 'Upload your resume or build one in the app, and attach it when you apply.' },
  { icon: Bookmark, title: 'Save for later', body: 'Shortlist interesting roles and come back before the deadline.' },
  { icon: Bell, title: 'Status notifications', body: 'Get notified in the app and by email when an employer updates your application.' },
];

function Features() {
  return (
    <section className="bg-white" aria-labelledby="features-heading">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <h2 id="features-heading" className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Everything you need to go from search to offer
          </h2>
        </div>
        <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <li key={title}>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-semibold text-neutral-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ───────────────────────── For employers / universities ───────────────────────── */

function ForEmployers() {
  const points = [
    'Free to start: post an internship at no cost',
    'All applicants and their resumes in one dashboard',
    'Update each application and students are notified automatically',
    'Verify your organization so students know who you are',
  ];
  return (
    <section id="for-employers" className="scroll-mt-20 bg-neutral-900 text-white" aria-labelledby="employers-heading">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-primary-300">
            <Building2 size={16} aria-hidden="true" /> For employers
          </p>
          <h2 id="employers-heading" className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            Reach students who are ready to start.
          </h2>
          <p className="mt-4 max-w-lg text-neutral-300">
            Skip the scattered messages and spreadsheets. Publish a role, receive applications, and manage the
            whole process from one place.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button as={Link} to="/auth/register?role=organization" size="lg">
              Post an internship
            </Button>
            <Button as={Link} to="/pricing" size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              See plans
            </Button>
          </div>
        </div>
        <ul className="space-y-4">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-500/20 text-success-300">
                <Check size={14} aria-hidden="true" />
              </span>
              <span className="text-sm leading-relaxed text-neutral-200">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ForUniversities() {
  return (
    <section className="bg-white" aria-labelledby="uni-heading">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600">
              <GraduationCap size={16} aria-hidden="true" /> For universities
              <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700">New</span>
            </p>
            <h2 id="uni-heading" className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
              See how your students are doing
            </h2>
            <p className="mt-2 text-neutral-600">
              Register your institution, share your join code, and view which of your students have joined, applied
              and been placed.
            </p>
          </div>
          <Button as={Link} to="/auth/register?role=university" variant="secondary" size="lg" className="shrink-0">
            Register your institution
          </Button>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-gradient-to-br from-primary-600 to-primary-800" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:py-20">
        <h2 id="cta-heading" className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Ready to take the first step?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-primary-100">
          Create your free account in a couple of minutes and start applying, or post your first internship.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button as={Link} to="/auth/register" size="lg" className="bg-white text-primary-700 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-white focus-visible:ring-offset-primary-700">
            Create a free account
          </Button>
          <Button as={Link} to="/internships" size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            Browse internships first
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  useEffect(() => {
    document.title = 'InternshipConnect | Find internships. Build your career.';
  }, []);

  return (
    <>
      <Hero />
      <OpenInternships />
      <HowItWorks />
      <Features />
      <ForEmployers />
      <ForUniversities />
      <FinalCta />
    </>
  );
}
