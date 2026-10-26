import { Link } from 'react-router-dom';
import Button from './Button';
import Modal from './Modal';

/**
 * Shown when a student reaches their monthly resume limit. Prices and plan
 * contents live on the plans page (served from the server's plan definitions),
 * so this only explains the limit and links there.
 */
const PricingModal = ({ isOpen, onClose, currentUsage, limit }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="sm">
    <Modal.Title>Monthly resume limit reached</Modal.Title>
    <p className="mt-2 text-sm text-neutral-600">
      You've created {currentUsage} of {limit} resumes this month. The count resets on the 1st. Other plans allow more resumes.
    </p>
    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button variant="secondary" onClick={onClose}>Not now</Button>
      <Button as={Link} to="/dashboard/pricing" onClick={onClose}>See plans</Button>
    </div>
  </Modal>
);

export default PricingModal;
