import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2 } from 'lucide-react';
import { savedInternshipsAPI } from '../services/api';
import { Alert, Button, EmptyState, PageHeader } from '../components';
import StatusBadge from '../components/StatusBadge';
import VerifiedBadge from '../components/VerifiedBadge';
import { opportunityLabel } from '../utils/opportunity';
import {
  formatCompensation,
  formatPlace,
  getArrangement,
  getDeadline,
  getOrgName,
  isVerifiedOrg,
} from '../utils/internship';

const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function SavedInternshipsPage() {
  const [state, setState] = useState({ status: 'loading', items: [] });
  const [removing, setRemoving] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    document.title = 'Saved | InternshipConnect';
    savedInternshipsAPI
      .getAll()
      .then((res) => setState({ status: 'ready', items: res.data?.data || [] }))
      .catch(() => setState({ status: 'error', items: [] }));
  }, []);

  const remove = async (id) => {
    setRemoving(id);
    setNotice(null);
    try {
      await savedInternshipsAPI.unsave(id);
      setState((s) => ({ ...s, items: s.items.filter((x) => x.internship?._id !== id) }));
    } catch {
      setNotice('We could not remove that listing. Please try again.');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Saved" description="Listings you've bookmarked to come back to." />

      {notice && <Alert variant="error" onDismiss={() => setNotice(null)} className="mb-5">{notice}</Alert>}

      {state.status === 'loading' && (
        <div className="space-y-4" aria-busy="true">
          {[0, 1, 2].map((n) => <div key={n} className="h-28 animate-pulse rounded-xl border border-neutral-200 bg-white" />)}
        </div>
      )}

      {state.status === 'error' && (
        <EmptyState title="We couldn't load your saved listings" description="Please check your connection and try again." action={<Button variant="secondary" onClick={() => window.location.reload()}>Reload</Button>} />
      )}

      {state.status === 'ready' && state.items.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description="Use “Save” on a listing to keep it here."
          action={<Button as={Link} to="/dashboard/internships">Browse opportunities</Button>}
        />
      )}

      {state.status === 'ready' && state.items.length > 0 && (
        <ul className="space-y-4">
          {state.items.map(({ _id, internship, savedAt }) => {
            if (!internship) return null;
            const org = getOrgName(internship);
            const where = [formatPlace(internship), getArrangement(internship)].filter(Boolean).join(' · ');
            const pay = formatCompensation(internship);
            const deadline = getDeadline(internship);
            const open = internship.status === 'active' && !deadline?.passed;
            return (
              <li key={_id || internship._id} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-neutral-900">{internship.title}</h2>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-neutral-600">
                      <span>{org || 'Employer'}</span>
                      {isVerifiedOrg(internship) && <VerifiedBadge />}
                    </p>
                  </div>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700">{opportunityLabel(internship)}</span>
                </div>

                <p className="mt-3 text-sm text-neutral-600">{[where, pay].filter(Boolean).join('  ·  ')}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
                  {!open && <StatusBadge kind="internship" status={internship.status === 'active' ? 'closed' : internship.status} />}
                  {deadline && <span>{deadline.label}</span>}
                  {savedAt && <span>· Saved {fmt(savedAt)}</span>}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button as={Link} size="sm" to={`/dashboard/internships/${internship._id}`}>{open ? 'View and apply' : 'View'}</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(internship._id)} loading={removing === internship._id} icon={<Trash2 size={15} aria-hidden="true" />}>
                    Remove
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
