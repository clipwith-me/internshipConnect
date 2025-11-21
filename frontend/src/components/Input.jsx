// frontend/src/components/Input.jsx
import { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * 🎓 LEARNING: Input Component
 * 
 * A versatile input component following Microsoft Fluent Design.
 * 
 * Features:
 * - Text, email, password, number, textarea types
 * - Label and helper text
 * - Error and success states
 * - Icon support (left/right)
 * - Password visibility toggle
 * - Character counter for textarea
 * - Disabled and readonly states
 * - Full accessibility
 */

const Input = forwardRef(({
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
  ...props
}, ref) => {
  
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState(props.value || props.defaultValue || '');
  
  // Determine actual input type
  const inputType = type === 'password' && showPassword ? 'text' : type;
  const isTextarea = type === 'textarea';
  const isPassword = type === 'password';
  
  // Base input styles
  const baseStyles = `
    w-full px-4 py-2
    border rounded-md
    transition-all duration-200
    focus:outline-none focus:ring-2
    disabled:bg-neutral-100 disabled:cursor-not-allowed
    placeholder:text-neutral-400
  `;
  
  // State-based styles
  const stateStyles = error
    ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
    : success
    ? 'border-success-500 focus:border-success-500 focus:ring-success-500'
    : focused
    ? 'border-primary-500 focus:border-primary-500 focus:ring-primary-500'
    : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500';
  
  // Icon padding
  const iconPaddingStyles = icon
    ? iconPosition === 'left'
      ? 'pl-10'
      : 'pr-10'
    : '';
  
  // Password toggle padding
  const passwordPaddingStyles = isPassword ? 'pr-10' : '';
  
  // Combined input classes
  const inputClasses = `
    ${baseStyles}
    ${stateStyles}
    ${iconPaddingStyles}
    ${passwordPaddingStyles}
    ${className}
  `.replace(/\s+/g, ' ').trim();
  
  // Handle value change
  const handleChange = (e) => {
    setValue(e.target.value);
    if (props.onChange) {
      props.onChange(e);
    }
  };
  
  // Common input props
  const commonProps = {
    ref,
    disabled,
    required,
    maxLength,
    className: inputClasses,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    onChange: handleChange,
    value,
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined,
    ...props,
  };
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {/* Label */}
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-neutral-700 mb-1"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            {icon}
          </div>
        )}
        
        {/* Input or Textarea */}
        {isTextarea ? (
          <textarea
            {...commonProps}
            rows={rows}
          />
        ) : (
          <input
            type={inputType}
            {...commonProps}
          />
        )}
        
        {/* Right icon */}
        {icon && iconPosition === 'right' && !isPassword && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-400">
            {icon}
          </div>
        )}
        
        {/* Password visibility toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        
        {/* Success indicator */}
        {success && !error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <CheckCircle size={18} className="text-success-500" />
          </div>
        )}
        
        {/* Error indicator */}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle size={18} className="text-error-500" />
          </div>
        )}
      </div>
      
      {/* Character counter */}
      {showCount && maxLength && (
        <div className="mt-1 text-xs text-neutral-500 text-right">
          {value.length}/{maxLength}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <p id={`${props.id}-error`} className="mt-1 text-sm text-error-500">
          {error}
        </p>
      )}
      
      {/* Success message */}
      {success && !error && (
        <p className="mt-1 text-sm text-success-500">
          {success}
        </p>
      )}
      
      {/* Helper text */}
      {helperText && !error && !success && (
        <p id={`${props.id}-helper`} className="mt-1 text-sm text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

/**
 * 🎓 USAGE EXAMPLES:
 * 
 * // Basic input
 * <Input
 *   id="name"
 *   label="Full Name"
 *   placeholder="Enter your name"
 * />
 * 
 * // Email input with icon
 * <Input
 *   id="email"
 *   type="email"
 *   label="Email Address"
 *   icon={<Mail size={18} />}
 *   required
 * />
 * 
 * // Password input
 * <Input
 *   id="password"
 *   type="password"
 *   label="Password"
 *   required
 * />
 * 
 * // Input with error
 * <Input
 *   id="username"
 *   label="Username"
 *   error="Username already exists"
 * />
 * 
 * // Input with success
 * <Input
 *   id="email"
 *   label="Email"
 *   success="Email is available"
 * />
 * 
 * // Textarea with character counter
 * <Input
 *   id="bio"
 *   type="textarea"
 *   label="Bio"
 *   rows={6}
 *   maxLength={500}
 *   showCount
 *   helperText="Tell us about yourself"
 * />
 * 
 * // Controlled input
 * const [value, setValue] = useState('');
 * <Input
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 * />
 */