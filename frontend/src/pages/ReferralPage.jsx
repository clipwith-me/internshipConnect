import { useEffect, useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { referralAPI } from '../services/api';
import { Alert, Button, PageHeader } from '../components';

const steps = [
  'Share your link with a friend.',
  'They sign up through it.',
  'Once their profile is at least 50% complete, we count it here.',
];

export default function ReferralPage() {
  const [state, setState] = useState({ status: 'loading', data: null });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = 'Refer a friend | InternshipConnect';
    referralAPI
      .getMyCode()
      .then((res) => setState({ status: 'ready', data: res.data?.data }))
      .catch(() => setState({ status: 'error', data: null }));
  }, []);

  const url = state.data?.referralUrl;

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the link is selectable on screen as a fallback.
    }
  };

  const whatsapp = () => {
    if (!url) return;
    const text = encodeURIComponent(`Join me on InternshipConnect to find internships and jobs: ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Refer a friend" description="Invite friends to InternshipConnect and see how many join." />

      {state.status === 'loading' && <div className="h-48 animate-pulse rounded-xl border border-neutral-200 bg-white" aria-busy="true" />}
      {state.status === 'error' && <Alert variant="error">We couldn't load your referral link. Please refresh and try again.</Alert>}

      {state.status === 'ready' && (
        <div className="space-y-6">
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <dt className="text-sm text-neutral-600">Friends who signed up</dt>
              <dd className="mt-1 text-3xl font-semibold text-neutral-900 tabular">{state.data?.totalReferrals || 0}</dd>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <dt className="text-sm text-neutral-600">Profiles completed</dt>
              <dd className="mt-1 text-3xl font-semibold text-neutral-900 tabular">{state.data?.completedReferrals || 0}</dd>
            </div>
          </dl>

          <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-neutral-900">Your link</h2>
            <p className="mt-1 text-sm text-neutral-600">Anyone who signs up through it is counted for you.</p>
            <div className="mt-3 flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3">
              <code className="min-w-0 flex-1 break-all text-sm text-neutral-800">{url || 'Not available'}</code>
              {state.data?.code && (
                <span className="shrink-0 rounded bg-neutral-200 px-2 py-0.5 text-xs font-semibold text-neutral-700">{state.data.code}</span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={copy} disabled={!url} icon={copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}>
                {copied ? 'Copied' : 'Copy link'}
              </Button>
              <Button variant="secondary" onClick={whatsapp} disabled={!url} icon={<Share2 size={16} aria-hidden="true" />}>
                Share on WhatsApp
              </Button>
            </div>
            <p className="sr-only" role="status" aria-live="polite">{copied ? 'Link copied to clipboard' : ''}</p>
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-neutral-900">How it works</h2>
            <ol className="mt-3 space-y-3">
              {steps.map((s, i) => (
                <li key={s} className="flex items-start gap-3 text-sm text-neutral-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </div>
  );
}
