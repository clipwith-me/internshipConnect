// frontend/src/components/Card.jsx

/**
 * 🎓 LEARNING: Card Component
 * 
 * A flexible container component following Microsoft Fluent Design.
 * 
 * Features:
 * - Composed of Header, Body, Footer
 * - Hover effects
 * - Clickable variants
 * - Different elevations (shadows)
 * - Padding variants
 */

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  clickable = false,
  elevation = 'base',
  padding = 'normal',
  ...props 
}) => {
  const baseStyles = 'bg-white rounded-lg overflow-hidden transition-shadow duration-200';
  
  // Elevation (shadow) levels
  const elevations = {
    none: '',
    sm: 'shadow-sm',
    base: 'shadow-base',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };
  
  // Hover effect
  const hoverStyles = hover ? 'hover:shadow-lg' : '';
  
  // Clickable styling
  const clickableStyles = clickable ? 'cursor-pointer hover:shadow-lg' : '';
  
  // Padding variants
  const paddings = {
    none: '',
    sm: 'p-4',
    normal: 'p-6',
    lg: 'p-8',
  };
  
  const cardClasses = `
    ${baseStyles}
    ${elevations[elevation]}
    ${hoverStyles}
    ${clickableStyles}
    ${paddings[padding]}
    ${className}
  `.replace(/\s+/g, ' ').trim();
  
  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

// Card Header Subcomponent
const CardHeader = ({ 
  children, 
  className = '',
  divider = true,
}) => {
  const baseStyles = 'flex items-center justify-between';
  const dividerStyles = divider ? 'pb-4 border-b border-neutral-200' : '';
  
  return (
    <div className={`${baseStyles} ${dividerStyles} ${className}`}>
      {children}
    </div>
  );
};

// Card Title Subcomponent
const CardTitle = ({ 
  children, 
  className = '' 
}) => {
  return (
    <h3 className={`text-xl font-semibold text-neutral-900 ${className}`}>
      {children}
    </h3>
  );
};

// Card Description Subcomponent
const CardDescription = ({ 
  children, 
  className = '' 
}) => {
  return (
    <p className={`text-sm text-neutral-500 ${className}`}>
      {children}
    </p>
  );
};

// Card Body Subcomponent
const CardBody = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`py-4 ${className}`}>
      {children}
    </div>
  );
};

// Card Footer Subcomponent
const CardFooter = ({ 
  children, 
  className = '',
  divider = true,
}) => {
  const baseStyles = 'flex items-center justify-between';
  const dividerStyles = divider ? 'pt-4 border-t border-neutral-200' : '';
  
  return (
    <div className={`${baseStyles} ${dividerStyles} ${className}`}>
      {children}
    </div>
  );
};

// Attach subcomponents to Card
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;

/**
 * 🎓 USAGE EXAMPLES:
 * 
 * // Simple card
 * <Card>
 *   <p>Card content here</p>
 * </Card>
 * 
 * // Card with header and footer
 * <Card>
 *   <Card.Header>
 *     <Card.Title>Internship Title</Card.Title>
 *   </Card.Header>
 *   <Card.Body>
 *     <p>Description of the internship...</p>
 *   </Card.Body>
 *   <Card.Footer>
 *     <Button variant="primary">Apply Now</Button>
 *   </Card.Footer>
 * </Card>
 * 
 * // Clickable card with hover
 * <Card 
 *   clickable 
 *   hover
 *   onClick={() => navigate('/internship/123')}
 * >
 *   <Card.Header>
 *     <div>
 *       <Card.Title>Software Engineer Intern</Card.Title>
 *       <Card.Description>Google • Remote</Card.Description>
 *     </div>
 *     <Badge>Featured</Badge>
 *   </Card.Header>
 *   <Card.Body>
 *     <p className="text-neutral-600">
 *       Join our team to work on cutting-edge projects...
 *     </p>
 *   </Card.Body>
 *   <Card.Footer>
 *     <span className="text-sm text-neutral-500">Posted 2 days ago</span>
 *     <span className="text-sm font-medium text-primary-500">$5,000/month</span>
 *   </Card.Footer>
 * </Card>
 * 
 * // Card with custom elevation
 * <Card elevation="lg">
 *   <p>High elevation card</p>
 * </Card>
 * 
 * // Card with no padding (for images)
 * <Card padding="none">
 *   <img src="image.jpg" alt="Cover" className="w-full" />
 *   <div className="p-6">
 *     <h3>Title</h3>
 *     <p>Content</p>
 *   </div>
 * </Card>
 * 
 * // Grid of cards
 * <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 *   {internships.map(internship => (
 *     <Card key={internship.id} hover>
 *       <Card.Header>
 *         <Card.Title>{internship.title}</Card.Title>
 *       </Card.Header>
 *       <Card.Body>
 *         <p>{internship.description}</p>
 *       </Card.Body>
 *     </Card>
 *   ))}
 * </div>
 */