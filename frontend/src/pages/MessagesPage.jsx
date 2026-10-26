import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Archive, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { messagingAPI } from '../services/api';
import { Alert, Button, EmptyState, PageHeader } from '../components';
import ConversationList from '../components/ConversationList';
import MessageThread from '../components/MessageThread';
import MessageInput from '../components/MessageInput';

/** Direct messaging between students (Pro) and employers. */
export default function MessagesPage() {
  const { user, hasFeature } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const allowed = user?.role === 'organization' || hasFeature?.('direct-messaging');

  useEffect(() => {
    document.title = 'Messages | InternshipConnect';
  }, []);

  useEffect(() => {
    if (!allowed) return;
    setLoading(true);
    messagingAPI
      .getConversations()
      .then((res) => setConversations(res.data?.data || []))
      .catch((err) => setError(err.response?.data?.upgradeRequired ? 'Direct messaging needs a Pro plan.' : 'We could not load your conversations.'))
      .finally(() => setLoading(false));
  }, [allowed]);

  useEffect(() => {
    if (!selected) return;
    setThreadLoading(true);
    messagingAPI
      .getMessages(selected._id)
      .then((res) => setMessages(res.data?.data?.messages || []))
      .catch(() => setError('We could not load this conversation.'))
      .finally(() => setThreadLoading(false));
  }, [selected]);

  const send = async (data) => {
    setSending(true);
    setError('');
    try {
      const res = await messagingAPI.sendMessage(selected._id, data);
      setMessages((m) => [...m, res.data.data]);
      setConversations((list) =>
        list.map((c) => (c._id === selected._id ? { ...c, lastMessage: { content: data.content, sender: user._id, sentAt: new Date() } } : c))
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Your message was not sent. Please try again.');
      throw err;
    } finally {
      setSending(false);
    }
  };

  const archive = async () => {
    try {
      await messagingAPI.archiveConversation(selected._id);
      setConversations((list) => list.filter((c) => c._id !== selected._id));
      setSelected(null);
      setMessages([]);
    } catch {
      setError('We could not archive this conversation.');
    }
  };

  if (!allowed) {
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState
          asPage
          title="Direct messaging is a Pro feature"
          description="Upgrade to message employers directly about your applications."
          action={<Button as={Link} to="/dashboard/pricing">See plans</Button>}
        />
      </div>
    );
  }

  const other = selected?.participants?.find((p) => p.user?._id !== user._id);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Messages" description={`${conversations.length} ${conversations.length === 1 ? 'conversation' : 'conversations'}`} />
      {error && <Alert variant="error" onDismiss={() => setError('')} className="mb-4">{error}</Alert>}

      <div className="flex h-[calc(100dvh-14rem)] min-h-[28rem] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className={`w-full shrink-0 border-r border-neutral-200 md:block md:w-80 ${selected ? 'hidden' : 'block'}`}>
          <ConversationList
            conversations={conversations}
            selectedConversationId={selected?._id}
            onSelectConversation={(c) => { setSelected(c); setMessages([]); }}
            currentUserId={user._id}
            loading={loading}
          />
        </div>

        <div className={`min-w-0 flex-1 flex-col ${selected ? 'flex' : 'hidden md:flex'}`}>
          {selected ? (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-neutral-200 p-3 sm:p-4">
                <div className="flex min-w-0 items-center gap-2">
                  <button type="button" onClick={() => { setSelected(null); setMessages([]); }} aria-label="Back to conversations" className="rounded p-1.5 text-neutral-600 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 md:hidden">
                    <ArrowLeft size={20} aria-hidden="true" />
                  </button>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-neutral-900">{other?.user?.email || 'Unknown'}</h2>
                    {selected.internship?.title && <p className="truncate text-xs text-neutral-600">Re: {selected.internship.title}</p>}
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={archive} icon={<Archive size={15} aria-hidden="true" />}>Archive</Button>
              </div>
              <MessageThread messages={messages} currentUserId={user._id} loading={threadLoading} />
              <MessageInput onSend={send} disabled={sending} />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              <div>
                <p className="text-base font-semibold text-neutral-900">Select a conversation</p>
                <p className="mt-1 text-sm text-neutral-600">Choose one from the list to read and reply.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
