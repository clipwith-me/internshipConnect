import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { paymentAPI } from '../services/api';
import { isAbortError } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { Alert, Button, PageHeader } from '../components';
import { describeOrganizationFeatures, describeStudentFeatures, formatPrice } from '../utils/plans';

/**
 * In-app plans. Plans, prices and feature lines come from the server's own plan
 * definitions (the same source the public page and the limits use), so nothing
 * shown here can drift from what a plan actually includes.
 */
export default function PricingPage() {
  const { user } = useAuth();
  const [state, setState] = useState({ status: 'loading', data: null });
  const [period, setPeriod] = useState('monthly');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const isStudent = user?.role === 'student';
  const currentPlan = (user?.subscription?.plan || (isStudent ? 'free' : 'basic')).toLowerCase();
  const hasPaid = user?.subscription?.status === 'active' && !['free', 'basic'].includes(currentPlan);

  useEffect(() => {
    document.title = 'Plans | InternshipConnect';
    const controller = new AbortController();
    paymentAPI
      .getPublicPlans({ signal: controller.signal })
      .then((res) => setState({ status: 'ready', data: res.data?.data }))
      .catch((err) => {
        if (!isAbortError(err)) setState({ status: 'error', data: null });
      });
    return () => controller.abort();
  }, []);

  const plans = state.data ? (isStudent ? state.data.student : state.data.organization) : [];
  const describe = isStudent ? describeStudentFeatures : describeOrganizationFeatures;

  const choose = async (plan) => {
    setError('');
    setBusy(plan.id);
    try {
      const res = await paymentAPI.createCheckout(plan.id, period);
      const url = res.data?.data?.url;
      if (!url) throw new Error('missing url');
      window.location.assign(url);
    } catch (err) {
      setError(err.response?.data?.error || 'We could not start checkout. Please try again.');
      setBusy(null);
    }
  };

  const manage = async () => {
    setError('');
    setBusy('portal');
    try {
      const res = await paymentAPI.createPortal();
      const url = res.data?.data?.url;
      if (!url) throw new Error('missing url');
      window.location.assign(url);
    } catch (err) {
      setError(err.response?.data?.error || 'We could not open billing. Please try again.');
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Plans"
        description={isStudent ? 'Start free. Upgrade only if you want more tools.' : 'Post for free. Upgrade as your hiring grows.'}
      />

      {error && <Alert variant="error" onDismiss={() => setError('')} className="mb-5">{error}</Alert>}

      {hasPaid && (
        <Alert variant="info" className="mb-5">
          You're on the {currentPlan} plan.{' '}
          <button type="button" onClick={manage} disabled={busy === 'portal'} className="font-semibold underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
            Manage or cancel billing
          </button>
        </Alert>
      )}

      <div role="group" aria-label="Billing period" className="mb-6 inline-flex rounded-md border border-neutral-300 bg-white p-0.5">
        {['monthly', 'yearly'].map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={period === p}
            onClick={() => setPeriod(p)}
            className={`rounded px-4 py-1.5 text-sm font-medium capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${period === p ? 'bg-primary-600 text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}
          >
            {p}
          </button>
        ))}
      </div>

      {state.status === 'loading' && (
        <div className="grid gap-6 md:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((n) => <div key={n} className="h-80 animate-pulse rounded-2xl border border-neutral-200 bg-white" />)}
        </div>
      )}

      {state.status === 'error' && (
        <Alert variant="warning" title="Plans are temporarily unavailable">
          Please refresh in a moment, or <Link to="/contact" className="font-medium underline">contact us</Link>.
        </Alert>
      )}

      {state.status === 'ready' && (
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const free = plan.monthlyPrice === 0;
            const price = period === 'yearly' && plan.yearlyPrice ? plan.yearlyPrice : plan.monthlyPrice;
            const current = plan.id === currentPlan;
            return (
              <li key={plan.id} className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${current ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-neutral-200'}`}>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-neutral-900">{plan.name}</h2>
                  {current && <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">Your plan</span>}
                </div>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-neutral-900 tabular">{formatPrice(price)}</span>
                  {!free && <span className="text-sm text-neutral-600">/ {period === 'yearly' ? 'year' : 'month'}</span>}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {describe(plan.features).map((line) => (
                    <li key={line} className="flex items-start gap-3 text-sm text-neutral-700">
                      <Check size={18} className="mt-0.5 shrink-0 text-success-600" aria-hidden="true" />
                      {line}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  {current ? (
                    <Button variant="secondary" fullWidth disabled>Current plan</Button>
                  ) : free ? null : plan.id === 'enterprise' ? (
                    <Button as={Link} to="/contact-sales" variant="secondary" fullWidth>Contact sales</Button>
                  ) : (
                    <Button fullWidth onClick={() => choose(plan)} loading={busy === plan.id} disabled={hasPaid || Boolean(busy)}>
                      Choose {plan.name}
                    </Button>
                  )}
                  {hasPaid && !current && !free && <p className="mt-2 text-xs text-neutral-600">To switch plans, manage billing above.</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-8 text-sm text-neutral-600">
        Prices are in US dollars and billed through Stripe. Refunds are considered case by case; see our{' '}
        <Link to="/terms" className="font-medium text-primary-600 hover:text-primary-700">Terms</Link>. Questions?{' '}
        <Link to="/contact" className="font-medium text-primary-600 hover:text-primary-700">Contact us</Link>.
      </p>
    </div>
  );
}
