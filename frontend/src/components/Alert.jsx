// frontend/src/components/Alert.jsx
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

/**
 * Inline message banner.
 *
 *   <Alert variant="error" title="Couldn't save">Check your connection and try again.</Alert>
 *
 * error/warning use role="alert" (announced immediately); info/success use
 * role="status" (announced politely). Pass `onDismiss` to make it dismissible.
 */
const STYLES = {
  info: { box: 'bg-primary-50 border-primary-200 text-primary-900', icon: Info, iconColor: 'text-primary-600' },
  success: { box: 'bg-success-50 border-success-100 text-success-700', icon: CheckCircle2, iconColor: 'text-success-600' },
  warning: { box: 'bg-warning-50 border-warning-100 text-warning-700', icon: AlertTriangle, iconColor: 'text-warning-600' },
  error: { box: 'bg-error-50 border-error-100 text-error-700', icon: AlertCircle, iconColor: 'text-error-600' },
};

const Alert = ({ variant = 'info', title, children, onDismiss, className = '' }) => {
  const s = STYLES[variant] || STYLES.info;
  const Icon = s.icon;
  const role = variant === 'error' || variant === 'warning' ? 'alert' : 'status';

  return (
    <div role={role} className={`flex items-start gap-3 rounded-lg border p-3.5 text-sm ${s.box} ${className}`}>
      <Icon size={18} className={`mt-0.5 shrink-0 ${s.iconColor}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="-m-1 rounded p-1 opacity-70 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
          aria-label="Dismiss message"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default Alert;
