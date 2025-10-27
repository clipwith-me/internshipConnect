// frontend/src/components/Modal.jsx
import { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

/**
 * 🎓 LEARNING: Modal Component
 * 
 * A dialog/popup component following Microsoft Fluent Design.
 * 
 * Features:
 * - Backdrop overlay
 * - Close on backdrop click or ESC key
 * - Composed of Header, Body, Footer
 * - Different sizes
 * - Animations
 * - Focus trap (accessibility)
 * - Body scroll lock when open
 */

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
  // Size variants
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };
  
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Handle ESC key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);
  
  // Don't render if not open
  if (!isOpen) return null;
  
  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-900 bg-opacity-50 backdrop-blur-sm animate-fadeIn"
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        className={`
          relative bg-white rounded-lg shadow-2xl
          w-full ${sizes[size]}
          animate-scaleIn
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors z-10"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        )}
        
        {/* Modal content */}
        {children}
      </div>
    </div>
  );
};

// Modal Header Subcomponent
const ModalHeader = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`px-6 py-4 border-b border-neutral-200 ${className}`}>
      {children}
    </div>
  );
};

// Modal Title Subcomponent
const ModalTitle = ({ 
  children, 
  className = '' 
}) => {
  return (
    <h2 className={`text-2xl font-semibold text-neutral-900 pr-8 ${className}`}>
      {children}
    </h2>
  );
};

// Modal Description Subcomponent
const ModalDescription = ({ 
  children, 
  className = '' 
}) => {
  return (
    <p className={`text-sm text-neutral-500 mt-1 ${className}`}>
      {children}
    </p>
  );
};

// Modal Body Subcomponent
const ModalBody = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

// Modal Footer Subcomponent
const ModalFooter = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
};

// Attach subcomponents
Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Description = ModalDescription;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;

/**
 * 🎓 USAGE EXAMPLES:
 * 
 * // Basic modal
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
 * 
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   <Modal.Header>
 *     <Modal.Title>Modal Title</Modal.Title>
 *   </Modal.Header>
 *   <Modal.Body>
 *     <p>Modal content goes here...</p>
 *   </Modal.Body>
 *   <Modal.Footer>
 *     <Button variant="secondary" onClick={() => setIsOpen(false)}>
 *       Cancel
 *     </Button>
 *     <Button onClick={() => setIsOpen(false)}>
 *       Confirm
 *     </Button>
 *   </Modal.Footer>
 * </Modal>
 * 
 * // Confirmation modal
 * <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} size="sm">
 *   <Modal.Header>
 *     <Modal.Title>Delete Application?</Modal.Title>
 *     <Modal.Description>
 *       This action cannot be undone.
 *     </Modal.Description>
 *   </Modal.Header>
 *   <Modal.Body>
 *     <p className="text-neutral-600">
 *       Are you sure you want to delete this application? All data will be permanently removed.
 *     </p>
 *   </Modal.Body>
 *   <Modal.Footer>
 *     <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
 *       Cancel
 *     </Button>
 *     <Button variant="danger" onClick={handleDelete}>
 *       Delete
 *     </Button>
 *   </Modal.Footer>
 * </Modal>
 * 
 * // Form modal (large)
 * <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} size="lg">
 *   <Modal.Header>
 *     <Modal.Title>Create Internship</Modal.Title>
 *     <Modal.Description>
 *       Fill in the details below to post a new internship
 *     </Modal.Description>
 *   </Modal.Header>
 *   <Modal.Body>
 *     <form className="space-y-4">
 *       <Input label="Title" required />
 *       <Input type="textarea" label="Description" rows={6} />
 *       <Input label="Location" />
 *     </form>
 *   </Modal.Body>
 *   <Modal.Footer>
 *     <Button variant="secondary" onClick={() => setIsFormOpen(false)}>
 *       Cancel
 *     </Button>
 *     <Button onClick={handleSubmit}>
 *       Create Internship
 *     </Button>
 *   </Modal.Footer>
 * </Modal>
 * 
 * // Modal without close button or backdrop close
 * <Modal
 *   isOpen={isProcessing}
 *   onClose={() => {}}
 *   closeOnBackdrop={false}
 *   closeOnEscape={false}
 *   showCloseButton={false}
 *   size="sm"
 * >
 *   <Modal.Body className="text-center py-8">
 *     <div className="animate-spin mx-auto mb-4">⏳</div>
 *     <p>Processing your application...</p>
 *   </Modal.Body>
 * </Modal>
 */