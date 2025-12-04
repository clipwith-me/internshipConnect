// frontend/src/pages/MessagesPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { messagingAPI } from '../services/api';
import ConversationList from '../components/ConversationList';
import MessageThread from '../components/MessageThread';
import MessageInput from '../components/MessageInput';
import { MessageCircle, Crown, ArrowLeft, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * MessagesPage Component
 * Pro Feature - Direct messaging between students and organizations
 */
const MessagesPage = () => {
  const { user, hasFeature } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Check Pro access
  const hasPro = user?.role === 'organization' || hasFeature?.('direct-messaging');

  // Load conversations
  useEffect(() => {
    if (!hasPro) return;

    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await messagingAPI.getConversations();
        setConversations(response.data.data || []);
      } catch (error) {
        console.error('Failed to load conversations:', error);
        if (error.response?.data?.upgradeRequired) {
          setError('Pro subscription required for direct messaging');
        } else {
          setError('Failed to load conversations');
        }
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [hasPro]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    const loadMessages = async () => {
      try {
        setMessagesLoading(true);
        const response = await messagingAPI.getMessages(selectedConversation._id);
        setMessages(response.data.data.messages || []);
      } catch (error) {
        console.error('Failed to load messages:', error);
        setError('Failed to load messages');
      } finally {
        setMessagesLoading(false);
      }
    };

    loadMessages();
  }, [selectedConversation]);

  // Send message
  const handleSendMessage = async (messageData) => {
    if (!selectedConversation) return;

    try {
      setSending(true);
      const response = await messagingAPI.sendMessage(
        selectedConversation._id,
        messageData
      );

      // Add new message to thread
      setMessages([...messages, response.data.data]);

      // Update last message in conversation list
      setConversations(conversations.map(conv =>
        conv._id === selectedConversation._id
          ? {
              ...conv,
              lastMessage: {
                content: messageData.content,
                sender: user._id,
                sentAt: new Date()
              }
            }
          : conv
      ));
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Archive conversation
  const handleArchiveConversation = async () => {
    if (!selectedConversation) return;

    try {
      await messagingAPI.archiveConversation(selectedConversation._id);

      // Remove from list
      setConversations(conversations.filter(c => c._id !== selectedConversation._id));
      setSelectedConversation(null);
      setMessages([]);
    } catch (error) {
      console.error('Failed to archive conversation:', error);
      setError('Failed to archive conversation');
    }
  };

  // Select conversation
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
  };

  // Back to conversation list (mobile)
  const handleBackToList = () => {
    setSelectedConversation(null);
    setMessages([]);
  };

  // Get other participant info
  const getOtherParticipant = () => {
    if (!selectedConversation) return null;
    return selectedConversation.participants?.find(
      p => p.user?._id !== user._id
    );
  };

  // Upgrade prompt for non-Pro users
  if (!hasPro) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-4">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>

          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            Pro Feature: Direct Messaging
          </h2>

          <p className="mb-6 text-gray-600">
            Upgrade to Pro to unlock direct messaging with organizations and get priority responses
            to your internship applications.
          </p>

          <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4 text-left">
            <h3 className="mb-2 font-semibold text-gray-900">Pro Benefits:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Direct messaging with organizations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Priority application review</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Featured profile visibility</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>All Premium features included</span>
              </li>
            </ul>
          </div>

          <Link
            to="/dashboard/pricing"
            className="mb-3 block w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white transition-transform hover:scale-105"
          >
            Upgrade to Pro
          </Link>

          <Link
            to="/dashboard"
            className="block text-sm text-gray-600 hover:text-gray-900"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <div className="flex h-screen bg-white">
      {/* Conversation List Sidebar */}
      <div
        className={`w-full border-r border-gray-200 md:w-80 ${
          selectedConversation ? 'hidden md:block' : 'block'
        }`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-2 py-1 text-xs font-semibold text-white">
              <Crown className="h-3 w-3" />
              <span>Pro</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Conversations */}
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?._id}
          onSelectConversation={handleSelectConversation}
          currentUserId={user._id}
          loading={loading}
        />
      </div>

      {/* Message Thread Area */}
      <div className={`flex flex-1 flex-col ${selectedConversation ? 'block' : 'hidden md:flex'}`}>
        {selectedConversation ? (
          <>
            {/* Thread Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToList}
                  className="md:hidden text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <span className="text-lg">
                    {otherParticipant?.userType === 'organization' ? '🏢' : '👤'}
                  </span>
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    {otherParticipant?.user?.email || 'Unknown'}
                  </h2>
                  {selectedConversation.internship?.title && (
                    <p className="text-xs text-gray-600">
                      Re: {selectedConversation.internship.title}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleArchiveConversation}
                className="text-gray-600 hover:text-gray-900"
                title="Archive conversation"
              >
                <Archive className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <MessageThread
              messages={messages}
              currentUserId={user._id}
              loading={messagesLoading}
            />

            {/* Message Input */}
            <MessageInput
              onSend={handleSendMessage}
              disabled={sending}
              placeholder="Type your message..."
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Select a conversation
              </h3>
              <p className="text-gray-600">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-red-600 px-4 py-3 text-white shadow-lg">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="absolute right-2 top-2 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
