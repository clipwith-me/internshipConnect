import { useEffect, useState } from 'react';
import { verificationAPI } from '../services/api';
import { Alert, Button, PageHeader } from '../components';

const field =
  'h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-500 hover:border-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/30';

const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default function VerificationPage() {
  const [state, setState] = useState({ status: 'loading', data: null });
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Company verification | InternshipConnect';
    verificationAPI
      .getStatus()
      .then((res) => setState({ status: 'ready', data: res.data?.data }))
      .catch(() => setState({ status: 'error', data: null }));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^https:\/\//i.test(documentUrl.trim())) {
      setError('Enter a public link that starts with https://');
      return;
    }
    setBusy(true);
    try {
      const res = await verificationAPI.submit({ documentUrl: documentUrl.trim(), documentName: documentName.trim() });
      setState({ status: 'ready', data: res.data?.data });
    } catch (err) {
      setError(err.response?.data?.error || 'We could not submit your request. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const current = state.data?.status;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Company verification"
        description="Our team reviews your registration document. Approved employers show a “Verified employer” badge on their listings."
      />

      {state.status === 'loading' && <div className="h-48 animate-pulse rounded-xl border border-neutral-200 bg-white" aria-busy="true" />}
      {state.status === 'error' && <Alert variant="error">We couldn't load your verification status. Please refresh.</Alert>}

      {state.status === 'ready' && (
        <div className="space-y-5">
          {current === 'approved' && (
            <Alert variant="success" title="Your company is verified">The badge appears on your listings.</Alert>
          )}
          {current === 'pending' && (
            <Alert variant="info" title="Under review">
              We'll update this page when a decision is made.{state.data?.submittedAt && ` Submitted ${fmt(state.data.submittedAt)}.`}
            </Alert>
          )}
          {current === 'rejected' && (
            <Alert variant="warning" title="Not approved">
              {state.data?.adminNote || 'You can submit a clearer document below.'}
            </Alert>
          )}

          {current !== 'approved' && current !== 'pending' && (
            <form onSubmit={submit} noValidate className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm text-neutral-600">
                Provide your CAC certificate, business licence or another official document. Upload it to a file host you control and paste the public link.
              </p>
              {error && <Alert variant="error">{error}</Alert>}
              <div>
                <label htmlFor="doc-url" className="mb-1.5 block text-sm font-medium text-neutral-800">
                  Document link <span className="text-error-600" aria-hidden="true">*</span>
                </label>
                <input id="doc-url" type="url" value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)} placeholder="https://" className={field} aria-describedby="doc-hint" />
                <p id="doc-hint" className="mt-1 text-xs text-neutral-500">Must be a public https link our reviewers can open.</p>
              </div>
              <div>
                <label htmlFor="doc-name" className="mb-1.5 block text-sm font-medium text-neutral-800">Document name</label>
                <input id="doc-name" type="text" value={documentName} onChange={(e) => setDocumentName(e.target.value)} placeholder="e.g. CAC certificate" className={field} />
              </div>
              <Button type="submit" loading={busy}>Submit for review</Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
