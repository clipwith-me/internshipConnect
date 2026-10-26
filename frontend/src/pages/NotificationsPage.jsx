import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { notificationAPI } from '../services/api';
import { Alert, Button, EmptyState, PageHeader } from '../components';

// The API stores specific types (e.g. "application_shortlisted"); the filter groups them.
const GROUPS = [
  { value: 'all', label: 'All types', match: () => true },
  { value: 'application', label: 'Applications', match: (t) => t.startsWith('application_') },
  { value: 'interview', label: 'Interviews', match: (t) => t === 'interview_scheduled' },
  { value: 'offer', label: 'Offers', match: (t) => t.startsWith('offer_') },
  { value: 'message', label: 'Messages', match: (t) => t === 'message_received' },
  { value: 'system', label: 'System', match: (t) => ['system', 'new_internship', 'internship_expiring', 'profile_incomplete'].includes(t) },
];

const typeLabel = (t = '') => t.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
// Stored as `read`; older code looked for `isRead`.
const isRead = (n) => Boolean(n.read ?? n.isRead);

export default function NotificationsPage() {
  const [state, setState] = useState({ status: 'loading', items: [], unread: 0 });
  const [readFilter, setReadFilter] = useState('all');
  const [group, setGroup] = useState('all');
  const [notice, setNotice] = useState('');

  const load = useCallback(() => {
    setState((s) => ({ ...s, status: 'loading' }));
    return notificationAPI
      .getAll({ limit: 50 })
      .then((res) => {
        const d = res.data?.data;
        setState({ status: 'ready', items: d?.notifications || [], unread: d?.unreadCount || 0 });
      })
      .catch(() => setState({ status: 'error', items: [], unread: 0 }));
  }, []);

  useEffect(() => {
    document.title = 'Notifications | InternshipConnect';
    load();
  }, [load]);

  const markRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setState((s) => ({ ...s, items: s.items.map((n) => (n._id === id ? { ...n, read: true } : n)), unread: Math.max(0, s.unread - 1) }));
    } catch {
      setNotice('We could not update that notification.');
    }
  };

  const markAll = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setState((s) => ({ ...s, items: s.items.map((n) => ({ ...n, read: true })), unread: 0 }));
    } catch {
      setNotice('We could not mark everything as read.');
    }
  };

  const remove = async (id) => {
    try {
      await notificationAPI.delete(id);
      setState((s) => {
        const gone = s.items.find((n) => n._id === id);
        return { ...s, items: s.items.filter((n) => n._id !== id), unread: gone && !isRead(gone) ? Math.max(0, s.unread - 1) : s.unread };
      });
    } catch {
      setNotice('We could not delete that notification.');
    }
  };

  const matcher = GROUPS.find((g) => g.value === group).match;
  const shown = state.items.filter(
    (n) => matcher(n.type || '') && (readFilter === 'all' || (readFilter === 'unread' ? !isRead(n) : isRead(n)))
  );

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Updates about your applications and messages."
        actions={state.unread > 0 ? <Button variant="secondary" onClick={markAll} icon={<CheckCheck size={16} aria-hidden="true" />}>Mark all read</Button> : undefined}
      />

      {notice && <Alert variant="error" onDismiss={() => setNotice('')} className="mb-4">{notice}</Alert>}

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Filter by read status" className="inline-flex rounded-md border border-neutral-300 bg-white p-0.5">
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={readFilter === f}
              onClick={() => setReadFilter(f)}
              className={`rounded px-3 py-1.5 text-sm font-medium capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${readFilter === f ? 'bg-primary-600 text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}
            >
              {f}{f === 'unread' && state.unread > 0 ? ` (${state.unread})` : ''}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="n-type" className="sr-only">Notification type</label>
          <select id="n-type" value={group} onChange={(e) => setGroup(e.target.value)} className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/30">
            {GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
      </div>

      {state.status === 'loading' && (
        <div className="space-y-3" aria-busy="true">{[0, 1, 2].map((n) => <div key={n} className="h-24 animate-pulse rounded-xl border border-neutral-200 bg-white" />)}</div>
      )}

      {state.status === 'error' && (
        <EmptyState title="We couldn't load notifications" description="Please check your connection and try again." action={<Button variant="secondary" onClick={load}>Try again</Button>} />
      )}

      {state.status === 'ready' && shown.length === 0 && (
        <EmptyState
          icon={Bell}
          title={readFilter === 'unread' ? "You're all caught up" : 'No notifications'}
          description={readFilter === 'unread' ? 'There is nothing unread.' : 'Updates will appear here as things happen.'}
        />
      )}

      {state.status === 'ready' && shown.length > 0 && (
        <ul className="space-y-3">
          {shown.map((n) => {
            const read = isRead(n);
            return (
              <li key={n._id} className={`rounded-xl border bg-white p-4 shadow-sm sm:p-5 ${read ? 'border-neutral-200' : 'border-primary-200 bg-primary-50/40'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-medium text-neutral-700">{typeLabel(n.type)}</span>
                      {!read && <span className="inline-flex items-center gap-1 font-medium text-primary-700"><span className="h-2 w-2 rounded-full bg-primary-600" aria-hidden="true" />Unread</span>}
                      <span>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                    </p>
                    <h2 className="mt-2 text-base font-semibold text-neutral-900">{n.title}</h2>
                    <p className="mt-1 text-sm text-neutral-700">{n.message}</p>
                    {n.actionUrl?.startsWith('/') && (
                      <Link to={n.actionUrl} onClick={() => !read && markRead(n._id)} className="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">View details</Link>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {!read && (
                      <button type="button" onClick={() => markRead(n._id)} aria-label="Mark as read" className="rounded-md p-2 text-neutral-600 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"><Check size={18} aria-hidden="true" /></button>
                    )}
                    <button type="button" onClick={() => remove(n._id)} aria-label="Delete notification" className="rounded-md p-2 text-neutral-600 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"><Trash2 size={18} aria-hidden="true" /></button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
