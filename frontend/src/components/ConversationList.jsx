// frontend/src/components/MessagesList.jsx
import { Building2, User, Circle } from 'lucide-react';

/**
 * ConversationList Component
 * Displays list of conversations in sidebar
 */
const ConversationList = ({
  conversations = [],
  selectedConversationId,
  onSelectConversation,
  currentUserId,
  loading = false
}) => {
  const getOtherParticipant = (conversation) => {
    return conversation.participants?.find(
      p => p.user?._id !== currentUserId && p.user !== currentUserId
    );
  };

  const formatLastMessageTime = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return '';
    return message.length > maxLength
      ? message.substring(0, maxLength) + '...'
      : message;
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="text-sm text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-3 text-4xl">💬</div>
          <h3 className="mb-1 text-sm font-semibold text-gray-900">No conversations</h3>
          <p className="text-xs text-gray-500">
            Start messaging organizations about internships
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((conversation) => {
        const otherParticipant = getOtherParticipant(conversation);
        const isSelected = conversation._id === selectedConversationId;
        const hasUnread = (conversation.unreadCount || 0) > 0;
        const isOrganization = otherParticipant?.userType === 'organization';

        return (
          <button
            key={conversation._id}
            onClick={() => onSelectConversation(conversation)}
            className={`w-full border-b border-gray-200 p-4 text-left transition-colors hover:bg-gray-50 ${
              isSelected ? 'bg-blue-50 hover:bg-blue-50' : 'bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                isOrganization ? 'bg-purple-100' : 'bg-blue-100'
              }`}>
                {isOrganization ? (
                  <Building2 className="h-6 w-6 text-purple-600" />
                ) : (
                  <User className="h-6 w-6 text-blue-600" />
                )}
              </div>

              {/* Conversation Info */}
              <div className="min-w-0 flex-1">
                {/* Name and Time */}
                <div className="mb-1 flex items-center justify-between">
                  <h3 className={`truncate text-sm font-semibold ${
                    hasUnread ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {otherParticipant?.user?.email || 'Unknown User'}
                  </h3>
                  <span className="ml-2 flex-shrink-0 text-xs text-gray-500">
                    {formatLastMessageTime(conversation.lastMessage?.sentAt || conversation.updatedAt)}
                  </span>
                </div>

                {/* Internship Title (if available) */}
                {conversation.internship?.title && (
                  <p className="mb-1 truncate text-xs text-gray-600">
                    Re: {conversation.internship.title}
                  </p>
                )}

                {/* Last Message */}
                <div className="flex items-center justify-between">
                  <p className={`truncate text-sm ${
                    hasUnread ? 'font-medium text-gray-900' : 'text-gray-600'
                  }`}>
                    {conversation.lastMessage?.sender === currentUserId && (
                      <span className="mr-1 text-gray-500">You:</span>
                    )}
                    {truncateMessage(conversation.lastMessage?.content || 'No messages yet')}
                  </p>

                  {/* Unread Badge */}
                  {hasUnread && (
                    <div className="ml-2 flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-semibold text-white">
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </div>
                  )}
                </div>

                {/* Pro Badge (if Pro conversation) */}
                {conversation.isPro && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                    <span>⭐</span>
                    <span>Pro</span>
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ConversationList;
