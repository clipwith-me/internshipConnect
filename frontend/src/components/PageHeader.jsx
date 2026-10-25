// frontend/src/components/PageHeader.jsx
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Consistent page heading for dashboard screens.
 *
 *   <PageHeader
 *     title="My applications"
 *     description="Track every application in one place."
 *     actions={<Button>New</Button>}
 *     backTo="/dashboard" backLabel="Dashboard"
 *   />
 *
 * Renders the page's single <h1>. Actions wrap below the title on small screens.
 */
const PageHeader = ({ title, description, actions, backTo, backLabel = 'Back', className = '' }) => (
  <header className={`mb-6 ${className}`}>
    {backTo && (
      <Link
        to={backTo}
        className="mb-3 inline-flex items-center gap-1.5 rounded text-sm font-medium text-neutral-600 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {backLabel}
      </Link>
    )}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-neutral-600 sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </div>
  </header>
);

export default PageHeader;
