import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, SearchX, X } from 'lucide-react';
import Button from './Button';
import EmptyState from './EmptyState';
import InternshipCard from './InternshipCard';

/**
 * Result list for useInternshipSearch(): count (announced), skeletons, cards,
 * pagination, and honest empty / error states.
 */
export default function InternshipResults({ search, emptyHint, cardTo }) {
  const { state, page, hasFilters, goToPage, clearAll, retry } = search;
  const total = state.pagination?.totalItems ?? 0;
  const totalPages = state.pagination?.totalPages ?? 1;

  let summary = '';
  if (state.status === 'loading') summary = 'Loading opportunities…';
  else if (state.status === 'ready') {
    summary = total === 0 ? 'No opportunities match your search.' : `${total} ${total === 1 ? 'opportunity' : 'opportunities'} found`;
  }

  return (
    <section aria-label="Search results">
      <div className="mb-5 flex min-h-[2rem] flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-neutral-700" role="status" aria-live="polite">{summary}</p>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <X size={16} aria-hidden="true" /> Clear filters
          </button>
        )}
      </div>

      {state.status === 'loading' && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl border border-neutral-200 bg-white" />
          ))}
        </div>
      )}

      {state.status === 'ready' && state.items.length > 0 && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {state.items.map((item) => (
              <InternshipCard key={item._id} internship={item} to={cardTo?.(item)} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)} icon={<ChevronLeft size={16} aria-hidden="true" />}>
                Previous
              </Button>
              <span className="text-sm text-neutral-600 tabular">Page {page} of {totalPages}</span>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)} icon={<ChevronRight size={16} aria-hidden="true" />} iconPosition="right">
                Next
              </Button>
            </nav>
          )}
        </>
      )}

      {state.status === 'ready' && state.items.length === 0 && (
        <EmptyState
          icon={SearchX}
          title={hasFilters ? 'No opportunities match those filters' : 'No opportunities are open right now'}
          description={hasFilters ? 'Try a broader keyword or remove a filter.' : emptyHint}
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clearAll}>Clear filters</Button>
            ) : (
              <Button as={Link} to="/auth/register">Create a free profile</Button>
            )
          }
        />
      )}

      {state.status === 'error' && (
        <EmptyState
          icon={SearchX}
          title="We couldn't load opportunities"
          description="This is usually a temporary connection problem. Please try again."
          action={<Button variant="secondary" onClick={retry}>Try again</Button>}
        />
      )}
    </section>
  );
}
