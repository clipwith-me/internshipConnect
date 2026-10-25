// frontend/src/hooks/useInternshipSearch.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { internshipAPI } from '../services/api';
import { isAbortError } from './useApi';
import { useDebounce } from './useDebounce';

// Filters that live in the URL (so results are shareable and back/forward work)
const SELECT_KEYS = ['opportunityType', 'type', 'compensationType', 'industry', 'skills', 'minSalary', 'maxSalary'];

/**
 * Search/filter/paginate internships with the state kept in the URL.
 *
 * - text inputs (keyword, city) are debounced before they reach the URL
 * - every change cancels the previous request
 * - `allowedKeys` limits which advanced filters are sent (e.g. plan-gated ones)
 */
export function useInternshipSearch({ pageSize = 9, allowedKeys = ['opportunityType', 'type', 'compensationType'] } = {}) {
  const [params, setParams] = useSearchParams();

  const urlSearch = params.get('search') || '';
  const urlLocation = params.get('location') || '';
  const page = Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1);
  const filters = Object.fromEntries(SELECT_KEYS.map((k) => [k, params.get(k) || '']));

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [locationInput, setLocationInput] = useState(urlLocation);
  const debouncedSearch = useDebounce(searchInput, 350);
  const debouncedLocation = useDebounce(locationInput, 350);

  const [state, setState] = useState({ status: 'loading', items: [], pagination: null });
  const [retryKey, setRetryKey] = useState(0);
  // The last text-filter values we wrote to the URL ourselves (vs. back/forward navigation)
  const pushed = useRef({ search: urlSearch, location: urlLocation });

  const update = useCallback(
    (changes, { resetPage = true } = {}) => {
      const next = new URLSearchParams(params);
      Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      if (resetPage) next.delete('page');
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  // Push debounced text to the URL, but only once it has caught up with what is typed
  // (otherwise a stale debounced value could undo "Clear filters").
  useEffect(() => {
    const settled = debouncedSearch === searchInput && debouncedLocation === locationInput;
    if (settled && (debouncedSearch.trim() !== urlSearch || debouncedLocation.trim() !== urlLocation)) {
      pushed.current = { search: debouncedSearch.trim(), location: debouncedLocation.trim() };
      update({ search: debouncedSearch.trim(), location: debouncedLocation.trim() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, debouncedLocation, searchInput, locationInput]);

  // Re-sync the inputs for external URL changes (back/forward), but never for our own echo.
  useEffect(() => {
    if (pushed.current.search === urlSearch && pushed.current.location === urlLocation) return;
    pushed.current = { search: urlSearch, location: urlLocation };
    setSearchInput(urlSearch);
    setLocationInput(urlLocation);
  }, [urlSearch, urlLocation]);

  const filterSignature = JSON.stringify(filters);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, status: 'loading' }));

    const query = { page, limit: pageSize };
    if (urlSearch) query.search = urlSearch;
    if (urlLocation) query.location = urlLocation;
    allowedKeys.forEach((k) => {
      if (filters[k]) query[k] = filters[k];
    });

    internshipAPI
      .getAll(query, { signal: controller.signal })
      .then((res) => {
        const data = res.data?.data;
        setState({ status: 'ready', items: data?.internships || [], pagination: data?.pagination || null });
      })
      .catch((err) => {
        if (!isAbortError(err)) setState({ status: 'error', items: [], pagination: null });
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, urlSearch, urlLocation, filterSignature, pageSize, retryKey, allowedKeys.join(',')]);

  const setFilter = (key, value) => update({ [key]: value });
  const goToPage = (p) => {
    update({ page: p > 1 ? String(p) : '' }, { resetPage: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const clearAll = () => {
    pushed.current = { search: '', location: '' };
    setSearchInput('');
    setLocationInput('');
    setParams(new URLSearchParams(), { replace: true });
  };

  const hasFilters = Boolean(urlSearch || urlLocation || SELECT_KEYS.some((k) => filters[k]));

  return {
    state,
    page,
    filters,
    hasFilters,
    searchInput,
    setSearchInput,
    locationInput,
    setLocationInput,
    setFilter,
    goToPage,
    clearAll,
    retry: () => setRetryKey((k) => k + 1),
  };
}
