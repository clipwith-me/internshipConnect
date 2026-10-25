// frontend/src/components/Modal.jsx
import { createContext, useContext, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Modal dialog.
 *
 * Accessibility:
 *  - role="dialog" aria-modal, named by <Modal.Title> via aria-labelledby
 *  - focus moves into the dialog on open, is trapped while open (Tab/Shift+Tab),
 *    and returns to the previously focused element on close
 *  - Escape closes (configurable); body scroll is locked and the previous
 *    overflow value restored
 *  - rendered in a portal so ancestors' overflow/transform can't clip it
 *
 * Layout: the dialog scrolls internally (max 90vh), so tall content is usable
 * on short or 320px-wide screens.
 */

const ModalContext = createContext({ titleId: undefined });

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), ' +
  'select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

const Modal = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
}) => {
  const titleId = useId();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Scroll lock + focus management
  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const dialog = dialogRef.current;
    const first = dialog?.querySelector(FOCUSABLE);
    (first || dialog)?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  // Escape + focus trap
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape' && closeOnEscape) {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;

      const nodes = dialogRef.current?.querySelectorAll(FOCUSABLE);
      if (!nodes || nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = nodes[0];
      const lastEl = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closeOnEscape]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) onClose?.();
  };

  return createPortal(
    <ModalContext.Provider value={{ titleId }}>
      <div
        className="fixed inset-0 z-modal flex items-center justify-center p-4"
        onMouseDown={handleBackdropClick}
      >
        <div className="absolute inset-0 bg-neutral-900/50 animate-fadeIn" aria-hidden="true" />

        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={`relative flex max-h-[90vh] w-full flex-col overflow-y-auto rounded-xl bg-white shadow-2xl outline-none animate-scaleIn ${SIZES[size] || SIZES.md} ${className}`}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Close dialog"
            >
              <X size={20} aria-hidden="true" />
            </button>
          )}
          {children}
        </div>
      </div>
    </ModalContext.Provider>,
    document.body
  );
};

const ModalHeader = ({ children, className = '' }) => (
  <div className={`border-b border-neutral-200 px-6 py-4 pr-12 ${className}`}>{children}</div>
);

const ModalTitle = ({ children, className = '' }) => {
  const { titleId } = useContext(ModalContext);
  return (
    <h2 id={titleId} className={`text-xl font-semibold text-neutral-900 ${className}`}>
      {children}
    </h2>
  );
};

const ModalDescription = ({ children, className = '' }) => (
  <p className={`mt-1 text-sm text-neutral-500 ${className}`}>{children}</p>
);

const ModalBody = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const ModalFooter = ({ children, className = '' }) => (
  <div
    className={`flex flex-wrap items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4 ${className}`}
  >
    {children}
  </div>
);

Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Description = ModalDescription;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
