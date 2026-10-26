import { useState } from 'react';
import { Send } from 'lucide-react';

const MAX_LENGTH = 2000;

/**
 * Text message composer. Attachments were removed: files were never uploaded,
 * so recipients received links that only worked in the sender's browser.
 */
const MessageInput = ({ onSend, disabled = false, placeholder = 'Write a message' }) => {
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const content = message.trim();
    if (!content || disabled) return;
    try {
      await onSend({ content, attachments: [] });
      setMessage('');
    } catch {
      // The page shows the error; keep the draft so nothing is lost.
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(e);
  };

  return (
    <form onSubmit={submit} className="border-t border-neutral-200 bg-white p-3 sm:p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="message-text" className="sr-only">Message</label>
          <textarea
            id="message-text"
            value={message}
            maxLength={MAX_LENGTH}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={2}
            className="max-h-40 w-full resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-500 hover:border-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/30 disabled:bg-neutral-50"
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/40 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </div>
      <p className="mt-1.5 text-xs text-neutral-600">Press Ctrl+Enter to send</p>
    </form>
  );
};

export default MessageInput;
