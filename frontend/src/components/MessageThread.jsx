import { useEffect, useRef } from 'react';

const timeLabel = (iso) => {
  const date = new Date(iso);
  const hours = (Date.now() - date.getTime()) / 36e5;
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (hours < 24) return time;
  if (hours < 48) return `Yesterday ${time}`;
  return `${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ${time}`;
};

/** Scrollable message thread. Sent messages are on the right. */
const MessageThread = ({ messages = [], currentUserId, loading = false }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  if (loading) {
    return <div className="flex-1 p-4" aria-busy="true"><div className="h-16 w-2/3 animate-pulse rounded-2xl bg-neutral-100" /></div>;
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center">
        <div>
          <p className="text-base font-semibold text-neutral-900">No messages yet</p>
          <p className="mt-1 text-sm text-neutral-600">Say hello below to start the conversation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-neutral-50 p-4" role="log" aria-live="polite" aria-label="Messages">
      <ul className="space-y-3">
        {messages.map((m, i) => {
          const own = m.sender?._id === currentUserId || m.sender === currentUserId;
          const newSender = i === 0 || messages[i - 1].sender?._id !== m.sender?._id;
          return (
            <li key={m._id || i} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] flex-col sm:max-w-[70%] ${own ? 'items-end' : 'items-start'}`}>
                {newSender && !own && <span className="mb-1 px-1 text-xs font-medium text-neutral-600">{m.sender?.email || 'Unknown'}</span>}
                <div className={`rounded-2xl px-4 py-2 ${own ? 'bg-primary-600 text-white' : 'border border-neutral-200 bg-white text-neutral-900'}`}>
                  <p className="whitespace-pre-wrap break-words text-sm">{m.content}</p>
                  <p className={`mt-1 text-right text-xs ${own ? 'text-primary-100' : 'text-neutral-600'}`}>
                    {timeLabel(m.createdAt)}
                    {own && m.status === 'read' && <span> · Read</span>}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div ref={endRef} />
    </div>
  );
};

export default MessageThread;
