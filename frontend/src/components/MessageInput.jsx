// frontend/src/components/MessageInput.jsx
import { useState } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

/**
 * MessageInput Component
 * Input field for sending messages with attachment support
 */
const MessageInput = ({ onSend, disabled = false, placeholder = 'Type a message...' }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() && attachments.length === 0) return;

    const messageData = {
      content: message.trim(),
      attachments: attachments
    };

    try {
      await onSend(messageData);
      setMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    // Send on Ctrl+Enter or Cmd+Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  const handleAttachment = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      // In a real implementation, upload files to Cloudinary/S3
      // For now, just store file metadata
      const newAttachments = files.map(file => ({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: URL.createObjectURL(file) // Temporary URL
      }));

      setAttachments([...attachments, ...newAttachments]);
    } catch (error) {
      console.error('Failed to upload attachment:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
            >
              <Paperclip className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{file.fileName}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Attachment Button */}
        <label
          className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white transition-colors hover:bg-gray-50 ${
            disabled || isUploading ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          <Paperclip className="h-5 w-5 text-gray-500" />
          <input
            type="file"
            multiple
            onChange={handleAttachment}
            disabled={disabled || isUploading}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
        </label>

        {/* Message Input */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-50"
            style={{
              minHeight: '40px',
              maxHeight: '120px',
              height: 'auto'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || (!message.trim() && attachments.length === 0) || isUploading}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>

      {/* Keyboard Hint */}
      <p className="mt-2 text-xs text-gray-500">
        Press <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono">Ctrl+Enter</kbd> to send
      </p>
    </div>
  );
};

export default MessageInput;
