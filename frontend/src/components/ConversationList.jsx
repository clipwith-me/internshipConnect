import { Building2, User } from 'lucide-react';

const timeLabel = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  const hours = (Date.now() - date.getTime()) / 36e5;
  if (hours < 1) {
    const m = Math.floor(hours * 60);
    return m <= 1 ? 'Just now' : `${m}m ago`;
  }
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  if (hours < 48) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

/** Sidebar list of conversations. */
const ConversationList = ({ conversations = [], selectedConversationId, onSelectConversation, currentUserId, loading = false }) => {
  const other = (c) => c.participants?.find((p) => p.user?._id !== currentUserId && p.user !== currentUserId);

  if (loading) {
    return (
      <div className="space-y-px p-2" aria-busy="true">
        {[0, 1, 2, 3].map((n) => <div key={n} className="h-20 animate-pulse rounded-lg bg-neutral-100" />)}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm font-semibold text-neutral-900">No conversations yet</p>
        <p className="mt-1 text-sm text-neutral-600">Messages about your applications and listings appear here.</p>
      </div>
    );
  }

  return (
    <ul className="h-full overflow-y-auto" aria-label="Conversations">
      {conversations.map((c) => {
        const person = other(c);
        const selected = c._id === selectedConversationId;
        const unread = c.unreadCount || 0;
        const isOrg = person?.userType === 'organization';
        const Icon = isOrg ? Building2 : User;
        return (
          <li key={c._id}>
            <button
              type="button"
              onClick={() => onSelectConversation(c)}
              aria-current={selected ? 'true' : undefined}
              className={`flex w-full items-start gap-3 border-b border-neutral-200 p-4 text-left hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 ${selected ? 'bg-primary-50 hover:bg-primary-50' : ''}`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600" aria-hidden="true"><Icon size={20} /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className={`truncate text-sm ${unread ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-800'}`}>{person?.user?.email || 'Unknown user'}</span>
                  <span className="shrink-0 text-xs text-neutral-600">{timeLabel(c.lastMessage?.sentAt || c.updatedAt)}</span>
                </span>
                {c.internship?.title && <span className="mt-0.5 block truncate text-xs text-neutral-600">Re: {c.internship.title}</span>}
                <span className="mt-1 flex items-center justify-between gap-2">
                  <span className={`truncate text-sm ${unread ? 'font-medium text-neutral-900' : 'text-neutral-600'}`}>
                    {c.lastMessage?.sender === currentUserId && <span className="text-neutral-500">You: </span>}
                    {c.lastMessage?.content || 'No messages yet'}
                  </span>
                  {unread > 0 && (
                    <span className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs font-semibold text-white">
                      <span aria-hidden="true">{unread > 99 ? '99+' : unread}</span>
                      <span className="sr-only">{unread} unread</span>
                    </span>
                  )}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default ConversationList;
