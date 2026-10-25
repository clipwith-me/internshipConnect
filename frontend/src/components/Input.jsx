// frontend/src/components/Input.jsx
import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Input / Textarea with label, helper text, validation states and icons.
 *
 * Works controlled (value + onChange) or uncontrolled. Caller-supplied
 * onChange/onFocus/onBlur are always honoured: they are called, never replaced.
 *
 * Accessibility: label bound by id (generated when none is given), errors are
 * announced (role="alert"), aria-invalid / aria-describedby are wired, and the
 * password visibility toggle is a real, keyboard-reachable, labelled button.
 */
const Input = forwardRef(function Input(
  {
    label,
    type = 'text',
    error,
    success,
    helperText,
    icon,
    iconPosition = 'left',
    required = false,
    disabled = false,
    fullWidth = true,
    maxLength,
    showCount = false,
    rows = 4,
    className = '',
    id: idProp,
    onChange,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const id = idProp || `field-${generatedId}`;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  const [showPassword, setShowPassword] = useState(false);
  // Only needed for the character counter when the field is uncontrolled.
  const [uncontrolledLength, setUncontrolledLength] = useState(
    String(props.defaultValue ?? '').length
  );

  const isTextarea = type === 'textarea';
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const currentLength =
    props.value !== undefined ? String(props.value ?? '').length : uncontrolledLength;

  const handleChange = (e) => {
    if (props.value === undefined) setUncontrolledLength(e.target.value.length);
    onChange?.(e);
  };

  const stateStyles = error
    ? 'border-error-500 focus:border-error-500 focus:ring-error-500/30'
    : success
    ? 'border-success-500 focus:border-success-500 focus:ring-success-500/30'
    : 'border-neutral-300 hover:border-neutral-400 focus:border-primary-500 focus:ring-primary-500/30';

  const paddingLeft = icon && iconPosition === 'left' ? 'pl-10' : 'pl-3.5';
  const paddingRight =
    isPassword || (icon && iconPosition === 'right') || error || success ? 'pr-10' : 'pr-3.5';

  const fieldClasses = [
    'block w-full rounded-md border bg-white text-sm text-neutral-900',
    'placeholder:text-neutral-500 transition-colors duration-150',
    'focus:outline-none focus:ring-4',
    'disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed',
    isTextarea ? 'py-2.5 resize-y min-h-[5rem]' : 'h-10',
    paddingLeft,
    paddingRight,
    stateStyles,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const describedBy = error ? errorId : helperText && !success ? helperId : undefined;

  const common = {
    id,
    ref,
    disabled,
    required,
    maxLength,
    className: fieldClasses,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    ...props,
    onChange: handleChange,
  };

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-700">
          {label}
          {required && (
            <span className="ml-0.5 text-error-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}

        {isTextarea ? <textarea {...common} rows={rows} /> : <input type={inputType} {...common} />}

        {icon && iconPosition === 'right' && !isPassword && !error && !success && (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-3 text-neutral-500 hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}

        {/* Status icons (not on password fields, where the toggle lives) */}
        {!isPassword && success && !error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3" aria-hidden="true">
            <CheckCircle size={18} className="text-success-500" />
          </div>
        )}
        {!isPassword && error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3" aria-hidden="true">
            <AlertCircle size={18} className="text-error-500" />
          </div>
        )}
      </div>

      {showCount && maxLength && (
        <div className="mt-1 text-right text-xs text-neutral-500 tabular">
          {currentLength}/{maxLength}
        </div>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-error-600">
          {error}
        </p>
      )}
      {success && !error && <p className="mt-1.5 text-sm text-success-600">{success}</p>}
      {helperText && !error && !success && (
        <p id={helperId} className="mt-1.5 text-sm text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
