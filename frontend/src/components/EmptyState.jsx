// frontend/src/components/EmptyState.jsx

/**
 * Honest empty state: says what is missing and what the user can do next.
 *
 *   <EmptyState
 *     icon={Briefcase}
 *     title="No applications yet"
 *     description="When you apply to an internship it will show up here."
 *     action={<Button as={Link} to="/dashboard/internships">Browse internships</Button>}
 *   />
 */
const EmptyState = ({ icon: Icon, title, description, action, className = '' }) => (
  <div
    className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center ${className}`}
  >
    {Icon && (
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
        <Icon size={22} aria-hidden="true" />
      </div>
    )}
    <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
    {description && <p className="mt-1.5 max-w-sm text-sm text-neutral-600">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
