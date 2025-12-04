// frontend/src/components/MessageThread.jsx
import { useEffect, useRef } from 'react';
import { FileText, Download } from 'lucide-react';

/**
 * MessageThread Component
 * Displays conversation messages in a scrollable thread
 */
const MessageThread = ({ messages = [], currentUserId, loading = false }) => {
  const messagesEndRef = useRef(null);
  const threadRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      // Today - show time
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (diffInHours < 48) {
      // Yesterday
      return 'Yesterday ' + date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      // Older - show date
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">💬</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No messages yet</h3>
          <p className="text-gray-500">Start the conversation by sending a message below.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={threadRef}
      className="flex-1 overflow-y-auto bg-gray-50 p-4"
      style={{ maxHeight: 'calc(100vh - 300px)' }}
    >
      <div className="space-y-4">
        {messages.map((message, index) => {
          const isOwnMessage = message.sender?._id === currentUserId || message.sender === currentUserId;
          const showSenderInfo = index === 0 || messages[index - 1].sender?._id !== message.sender?._id;

          return (
            <div
              key={message._id || index}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                {/* Sender Name (only show when sender changes) */}
                {showSenderInfo && !isOwnMessage && (
                  <div className="mb-1 px-3 text-xs font-medium text-gray-600">
                    {message.sender?.email || 'Unknown'}
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 shadow-sm'
                  }`}
                >
                  {/* Message Content */}
                  <p className="whitespace-pre-wrap break-words text-sm">
                    {message.content}
                  </p>

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((file, fileIndex) => (
                        <a
                          key={fileIndex}
                          href={file.fileUrl}
                          download={file.fileName}
                          className={`flex items-center gap-2 rounded-lg border p-2 text-sm transition-colors ${
                            isOwnMessage
                              ? 'border-blue-500 bg-blue-500/10 hover:bg-blue-500/20'
                              : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-xl">{getFileIcon(file.fileType)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium">{file.fileName}</div>
                            <div className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                              {formatFileSize(file.fileSize)}
                            </div>
                          </div>
                          <Download className={`h-4 w-4 ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`} />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    className={`mt-1 text-right text-xs ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.createdAt)}
                    {message.status === 'read' && isOwnMessage && (
                      <span className="ml-1">✓✓</span>
                    )}
                    {message.status === 'delivered' && isOwnMessage && (
                      <span className="ml-1">✓</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageThread;
