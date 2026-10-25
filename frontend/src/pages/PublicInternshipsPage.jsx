import { useEffect } from 'react';
import { useInternshipSearch } from '../hooks/useInternshipSearch';
import InternshipSearchBar from '../components/InternshipSearchBar';
import InternshipResults from '../components/InternshipResults';

/**
 * Public browse page. Filters live in the URL, so results are shareable and the
 * browser back/forward buttons work. Detail pages and applying require an
 * account: signed-out visitors are sent through sign-in and returned.
 */
export default function PublicInternshipsPage() {
  const search = useInternshipSearch({ pageSize: 9 });

  useEffect(() => {
    document.title = 'Browse internships | InternshipConnect';
  }, []);

  return (
    <div className="bg-neutral-50">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">Browse internships</h1>
          <p className="mt-2 max-w-2xl text-neutral-600">
            Search open internships posted by employers. Create a free account to see full details and apply.
          </p>
          <div className="mt-6">
            <InternshipSearchBar search={search} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <InternshipResults
          search={search}
          emptyHint="Employers add new internships regularly. Create a free profile so you are ready to apply when they do."
        />
      </div>
    </div>
  );
}
