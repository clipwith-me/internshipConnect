// frontend/src/components/Badge.jsx

/**
 * 🎓 LEARNING: Badge Component
 * 
 * Small status indicators following Microsoft Fluent Design.
 * 
 * Features:
 * - Multiple variants (primary, success, warning, error, neutral)
 * - Different sizes
 * - Dot indicator option
 * - Removable option
 */

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  onRemove,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full';
  
  // Variant styles
  const variants = {
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    error: 'bg-error-100 text-error-700',
    info: 'bg-info-100 text-info-700',
    neutral: 'bg-neutral-100 text-neutral-700',
  };
  
  // Size styles
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  
  // Dot color based on variant
  const dotColors = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    info: 'bg-info-500',
    neutral: 'bg-neutral-500',
  };
  
  const badgeClasses = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();
  
  return (
    <span className={badgeClasses}>
      {dot && (
        <span className={`w-2 h-2 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:opacity-70 transition-opacity"
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Badge;

/**
 * 🎓 USAGE EXAMPLES:
 * 
 * // Basic badges
 * <Badge>Featured</Badge>
 * <Badge variant="success">Active</Badge>
 * <Badge variant="error">Expired</Badge>
 * 
 * // With dot indicator
 * <Badge variant="success" dot>Online</Badge>
 * 
 * // Different sizes
 * <Badge size="sm">Small</Badge>
 * <Badge size="lg">Large</Badge>
 * 
 * // Removable badge
 * <Badge onRemove={() => console.log('Removed')}>
 *   React
 * </Badge>
 * 
 * // Status indicators
 * <Badge variant="success" dot>Accepted</Badge>
 * <Badge variant="warning" dot>Pending</Badge>
 * <Badge variant="error" dot>Rejected</Badge>
 * 
 * // Skill tags
 * <div className="flex flex-wrap gap-2">
 *   {skills.map(skill => (
 *     <Badge key={skill} onRemove={() => removeSkill(skill)}>
 *       {skill}
 *     </Badge>
 *   ))}
 * </div>
 */