// frontend/src/components/Button.jsx
import { forwardRef } from 'react';

/**
 * Button
 *
 * Variants: primary | secondary | outline | ghost | danger | success
 * Sizes:    sm (32px) | md (40px) | lg (48px)
 *
 * - `loading` disables the button, shows a spinner and sets aria-busy.
 * - `as` renders a different element (e.g. react-router's <Link>) with button
 *   styling, so a navigation never needs a <button> nested inside an <a>.
 * - Focus ring only appears for keyboard users (focus-visible).
 */

const BASE =
  'inline-flex items-center justify-center whitespace-nowrap font-medium select-none ' +
  'rounded-md transition-colors duration-150 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:pointer-events-none';

const VARIANTS = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary-500 shadow-sm',
  secondary:
    'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 active:bg-neutral-100 focus-visible:ring-neutral-400 shadow-sm',
  outline:
    'bg-transparent text-primary-600 border border-primary-500 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-500',
  ghost:
    'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-neutral-400',
  danger:
    'bg-error-500 text-white hover:bg-error-600 active:bg-error-700 focus-visible:ring-error-500 shadow-sm',
  success:
    'bg-success-500 text-white hover:bg-success-600 active:bg-success-700 focus-visible:ring-success-500 shadow-sm',
};

const SIZES = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

const Spinner = () => (
  <svg
    className="h-4 w-4 animate-spin motion-reduce:animate-none"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const Button = forwardRef(function Button(
  {
    as: Component = 'button',
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
  },
  ref
) {
  const isButton = Component === 'button';
  const inactive = disabled || loading;

  const classes = [
    BASE,
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Native <button> gets `disabled`; other elements get aria-disabled + no click.
  const stateProps = isButton
    ? { type, disabled: inactive }
    : { 'aria-disabled': inactive || undefined, tabIndex: inactive ? -1 : props.tabIndex };

  const handleClick = (e) => {
    if (inactive && !isButton) {
      e.preventDefault();
      return;
    }
    props.onClick?.(e);
  };

  return (
    <Component
      ref={ref}
      className={classes}
      aria-busy={loading || undefined}
      {...props}
      {...stateProps}
      onClick={handleClick}
    >
      {loading && <Spinner />}
      {!loading && icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      {children}
      {!loading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </Component>
  );
});

export default Button;
