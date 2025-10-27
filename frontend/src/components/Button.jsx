// frontend/src/components/Button.jsx
import { forwardRef } from 'react';

/**
 * 🎓 LEARNING: Button Component
 * 
 * A reusable button following Microsoft Fluent Design.
 * 
 * Features:
 * - Multiple variants (primary, secondary, outline, ghost, danger)
 * - Multiple sizes (sm, md, lg)
 * - Loading state
 * - Icon support
 * - Disabled state
 * - Full accessibility (ARIA)
 */

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  type = 'button',
  className = '',
  ...props
}, ref) => {
  
  // Base styles (applied to all buttons)
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    rounded-base
  `;
  
  // Variant styles
  const variants = {
    primary: `
      bg-primary-500 text-white
      hover:bg-primary-600
      active:bg-primary-700
      focus:ring-primary-500
      shadow-sm hover:shadow-md
    `,
    
    secondary: `
      bg-neutral-100 text-neutral-700
      hover:bg-neutral-200
      active:bg-neutral-300
      focus:ring-neutral-500
      border border-neutral-200
    `,
    
    outline: `
      bg-transparent border-2 border-primary-500 text-primary-500
      hover:bg-primary-50
      active:bg-primary-100
      focus:ring-primary-500
    `,
    
    ghost: `
      bg-transparent text-primary-500
      hover:bg-primary-50
      active:bg-primary-100
      focus:ring-primary-500
    `,
    
    danger: `
      bg-error-500 text-white
      hover:bg-error-600
      active:bg-error-700
      focus:ring-error-500
      shadow-sm hover:shadow-md
    `,
    
    success: `
      bg-success-500 text-white
      hover:bg-success-600
      active:bg-success-700
      focus:ring-success-500
      shadow-sm hover:shadow-md
    `,
  };
  
  // Size styles
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };
  
  // Width style
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Combined classes
  const buttonClasses = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${widthClass}
    ${className}
  `.replace(/\s+/g, ' ').trim();
  
  // Loading spinner component
  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
  
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={buttonClasses}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {/* Loading spinner */}
      {loading && <LoadingSpinner />}
      
      {/* Left icon */}
      {!loading && icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      
      {/* Button text */}
      <span>{children}</span>
      
      {/* Right icon */}
      {!loading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

/**
 * 🎓 USAGE EXAMPLES:
 * 
 * // Basic primary button
 * <Button>Click me</Button>
 * 
 * // Secondary button
 * <Button variant="secondary">Cancel</Button>
 * 
 * // Outline button with icon
 * <Button variant="outline" icon={<PlusIcon />}>
 *   Add Item
 * </Button>
 * 
 * // Loading state
 * <Button loading>Saving...</Button>
 * 
 * // Disabled
 * <Button disabled>Can't click</Button>
 * 
 * // Large danger button
 * <Button variant="danger" size="lg">
 *   Delete Account
 * </Button>
 * 
 * // Full width
 * <Button fullWidth>Submit Form</Button>
 * 
 * // With click handler
 * <Button onClick={() => console.log('Clicked!')}>
 *   Click me
 * </Button>
 */