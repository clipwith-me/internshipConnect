import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { paymentAPI } from '../services/api';
import { isAbortError } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { Alert, Button } from '../components';
import PageHero from '../components/PageHero';
import { describeOrganizationFeatures, describeStudentFeatures, formatPrice } from '../utils/plans';

function PlanCard({ plan, lines, ctaTo, ctaLabel }) {
  const free = plan.monthlyPrice === 0;
  return (
    <li className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-lg font-semibold text-neutral-900">{plan.name}</h3>
      <p className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight text-neutral-900">{formatPrice(plan.monthlyPrice)}</span>
        {!free && <span className="text-sm text-neutral-500">/ month</span>}
      </p>
      <p className="mt-1 min-h-[1.25rem] text-sm text-neutral-500">
        {!free && plan.yearlyPrice > 0 ? `or ${formatPrice(plan.yearlyPrice)} billed yearly` : ''}
      </p>
      <ul className="mt-6 flex-1 space-y-3">
        {lines.map((l) => (
          <li key={l} className="flex items-start gap-3 text-sm text-neutral-700">
            <Check size={18} className="mt-0.5 shrink-0 text-success-600" aria-hidden="true" />
            {l}
          </li>
        ))}
      </ul>
      <Button as={Link} to={ctaTo} variant={free ? 'secondary' : 'primary'} fullWidth className="mt-8">
        {ctaLabel}
      </Button>
    </li>
  );
}

function PlanGroup({ id, title, description, plans, describe, ctaTo, isAuthenticated }) {
  return (
    <section aria-labelledby={id} className="mt-14 first:mt-0">
      <h2 id={id} className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h2>
      <p className="mt-1.5 text-neutral-600">{description}</p>
      <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            lines={describe(plan.features)}
            ctaTo={isAuthenticated ? '/dashboard/pricing' : ctaTo}
            ctaLabel={isAuthenticated ? 'Manage plan' : plan.monthlyPrice === 0 ? 'Start free' : 'Get started'}
          />
        ))}
      </ul>
    </section>
  );
}

export default function PublicPricingPage() {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState({ status: 'loading', data: null });

  useEffect(() => {
    document.title = 'Pricing | InternshipConnect';
    const controller = new AbortController();
    paymentAPI
      .getPublicPlans({ signal: controller.signal })
      .then((res) => setState({ status: 'ready', data: res.data?.data }))
      .catch((err) => {
        if (!isAbortError(err)) setState({ status: 'error', data: null });
      });
    return () => controller.abort();
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Simple, transparent pricing"
        description="Students can start for free. Employers can post for free, and upgrade as hiring grows."
      />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {state.status === 'loading' && (
          <div className="grid gap-6 md:grid-cols-3" aria-busy="true" aria-label="Loading plans">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl border border-neutral-200 bg-neutral-100" />
            ))}
          </div>
        )}

        {state.status === 'error' && (
          <Alert variant="warning" title="Pricing is temporarily unavailable">
            We couldn't load the plans just now. Please refresh in a moment, or{' '}
            <Link to="/contact" className="font-medium underline">contact us</Link>.
          </Alert>
        )}

        {state.status === 'ready' && state.data && (
          <>
            <PlanGroup
              id="student-plans"
              title="For students"
              description="Find and apply to internships at no cost. Upgrade only if you want more tools."
              plans={state.data.student}
              describe={describeStudentFeatures}
              ctaTo="/auth/register"
              isAuthenticated={isAuthenticated}
            />
            <PlanGroup
              id="employer-plans"
              title="For employers"
              description="Post internships and manage applicants. Paid plans add capacity and analytics."
              plans={state.data.organization}
              describe={describeOrganizationFeatures}
              ctaTo="/auth/register?role=organization"
              isAuthenticated={isAuthenticated}
            />
            <p className="mt-12 text-center text-sm text-neutral-500">
              Prices are in US dollars. Paid plans are billed through Stripe, and you can manage or cancel from your
              account. Questions?{' '}
              <Link to="/contact" className="font-medium text-primary-600 hover:text-primary-700">Contact us</Link>.
            </p>
          </>
        )}
      </div>
    </>
  );
}
