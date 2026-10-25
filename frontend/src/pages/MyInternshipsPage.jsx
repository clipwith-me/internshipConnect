import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Eye, Pencil, Plus, Send, Trash2 } from 'lucide-react';
import { internshipAPI } from '../services/api';
import { isAbortError } from '../hooks/useApi';
import { Alert, Button, EmptyState, Modal, PageHeader } from '../components';
import StatusBadge from '../components/StatusBadge';
import { formatPlace, getArrangement } from '../utils/internship';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

const Stat = ({ label, value }) => (
  <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
    <p className="text-sm text-neutral-600">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-neutral-900 tabular">{value}</p>
  </div>
);

export default function MyInternshipsPage() {
  const [state, setState] = useState({ status: 'loading', items: [] });
  const [reload, setReload] = useState(0);
  const [notice, setNotice] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    document.title = 'My listings | InternshipConnect';
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    internshipAPI
      .getMyInternships({ signal: controller.signal })
      .then((res) => setState({ status: 'ready', items: res.data?.data || [] }))
      .catch((err) => {
        if (!isAbortError(err)) setState({ status: 'error', items: [] });
      });
    return () => controller.abort();
  }, [reload]);

  const refresh = () => setReload((n) => n + 1);

  const publish = async (item) => {
    setBusyId(item._id);
    try {
      await internshipAPI.publish(item._id);
      setNotice({ type: 'success', text: `“${item.title}” is now live.` });
      refresh();
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.error || 'Could not publish this listing.' });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    const item = toDelete;
    setBusyId(item._id);
    try {
      await internshipAPI.delete(item._id);
      setToDelete(null);
      setNotice({ type: 'success', text: `“${item.title}” was closed. Existing applications are kept.` });
      refresh();
    } catch (err) {
      setToDelete(null);
      setNotice({ type: 'error', text: err.response?.data?.error || 'Could not close this listing.' });
    } finally {
      setBusyId(null);
    }
  };

  const items = state.items;
  const open = items.filter((i) => i.status === 'active').length;
  const drafts = items.filter((i) => i.status === 'draft').length;
  const applications = items.reduce((n, i) => n + (i.statistics?.applications || 0), 0);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="My listings"
        description="Post, edit and close your internships, jobs and other opportunities."
        actions={
          <Button as={Link} to="/dashboard/internships/create" icon={<Plus size={16} aria-hidden="true" />}>
            Post opportunity
          </Button>
        }
      />

      {notice && <Alert variant={notice.type} onDismiss={() => setNotice(null)} className="mb-5">{notice.text}</Alert>}

      {state.status === 'loading' && (
        <div className="space-y-4" aria-busy="true">
          {[0, 1, 2].map((n) => <div key={n} className="h-28 animate-pulse rounded-xl border border-neutral-200 bg-white" />)}
        </div>
      )}

      {state.status === 'error' && (
        <EmptyState title="We couldn't load your listings" description="Please check your connection and try again." action={<Button variant="secondary" onClick={refresh}>Try again</Button>} />
      )}

      {state.status === 'ready' && items.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="No listings yet"
          description="Post your first opportunity to start receiving applications."
          action={<Button as={Link} to="/dashboard/internships/create">Post an internship</Button>}
        />
      )}

      {state.status === 'ready' && items.length > 0 && (
        <>
          <dl className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Listings" value={items.length} />
            <Stat label="Open" value={open} />
            <Stat label="Drafts" value={drafts} />
            <Stat label="Applications" value={applications} />
          </dl>

          <ul className="space-y-3">
            {items.map((i) => {
              const where = [formatPlace(i), getArrangement(i)].filter(Boolean).join(' · ');
              return (
                <li key={i._id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-neutral-900 sm:text-lg">{i.title}</h2>
                      <p className="mt-0.5 text-sm text-neutral-600">{where || 'Location not set'}</p>
                    </div>
                    <StatusBadge kind="internship" status={i.status} />
                  </div>

                  <p className="mt-3 text-sm text-neutral-600 tabular">
                    {i.statistics?.applications || 0} applications · {i.statistics?.views || 0} views · Posted {fmt(i.createdAt)}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {i.status === 'draft' && (
                      <Button size="sm" onClick={() => publish(i)} loading={busyId === i._id} icon={<Send size={15} aria-hidden="true" />}>Publish</Button>
                    )}
                    <Button as={Link} size="sm" variant="secondary" to={`/dashboard/internships/${i._id}`} icon={<Eye size={15} aria-hidden="true" />}>View</Button>
                    <Button as={Link} size="sm" variant="secondary" to={`/dashboard/internships/${i._id}/edit`} icon={<Pencil size={15} aria-hidden="true" />}>Edit</Button>
                    {i.status !== 'closed' && (
                      <Button size="sm" variant="ghost" onClick={() => setToDelete(i)} icon={<Trash2 size={15} aria-hidden="true" />}>Close</Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <Modal isOpen={Boolean(toDelete)} onClose={() => setToDelete(null)} size="sm">
        <Modal.Title>Close this listing?</Modal.Title>
        <p className="mt-2 text-sm text-neutral-600">
          “{toDelete?.title}” will stop accepting applications and disappear from search. Existing applications are kept.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setToDelete(null)}>Keep open</Button>
          <Button variant="danger" onClick={remove} loading={busyId === toDelete?._id}>Close listing</Button>
        </div>
      </Modal>
    </div>
  );
}
