// frontend/src/hooks/useApi.js
import { useEffect, useRef, useState, useCallback } from 'react';

const isAbort = (error) =>
  error?.name === 'AbortError' || error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED';

/**
 * Request-cancellation handle.
 *
 * Returns a *stable* object (same identity on every render) whose `signal`
 * getter is always defined, including during the very first render, and always
 * belongs to a live controller. All requests started by the component are
 * aborted when it unmounts.
 *
 * (The previous implementation returned `ref.current`, which was `null` on the
 * first render, so first requests silently had no signal and could never be
 * cancelled; it was also not stable, which fed `exhaustive-deps` warnings.)
 *
 * Usage:
 *   const abortController = useApi();
 *   useEffect(() => {
 *     api.get('/x', { signal: abortController.signal }).catch((e) => {
 *       if (isAbortError(e)) return;
 *       ...
 *     });
 *   }, [abortController]);
 */
export const useApi = () => {
  const controllerRef = useRef(null);
  const handleRef = useRef(null);

  if (handleRef.current === null) {
    handleRef.current = {
      get signal() {
        // Recreate after an abort so StrictMode's mount -> unmount -> mount
        // cycle (and any later re-mount) gets a working signal again.
        if (controllerRef.current === null || controllerRef.current.signal.aborted) {
          controllerRef.current = new AbortController();
        }
        return controllerRef.current.signal;
      },
    };
  }

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return handleRef.current;
};

/** True when an error is just a cancelled request and should be ignored. */
export const isAbortError = isAbort;

/**
 * Request wrapper with loading/error/data state and de-duplication of
 * concurrent calls.
 *
 * Usage:
 *   const { loading, error, data, execute } = useApiCall(apiFunction);
 */
export const useApiCall = (apiFunction) => {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null,
  });

  const abortController = useApi();
  const pendingRequestRef = useRef(false);

  const execute = useCallback(
    async (...args) => {
      // Skip if a request is already in flight
      if (pendingRequestRef.current) return;

      try {
        pendingRequestRef.current = true;
        setState({ loading: true, error: null, data: null });

        const result = await apiFunction(...args, { signal: abortController.signal });

        setState({ loading: false, error: null, data: result.data });
        return result.data;
      } catch (error) {
        // Cancelled (e.g. unmounted): do not touch state.
        if (isAbort(error)) return;
        setState({ loading: false, error, data: null });
        throw error;
      } finally {
        pendingRequestRef.current = false;
      }
    },
    [apiFunction, abortController]
  );

  return { ...state, execute };
};

export default useApi;
