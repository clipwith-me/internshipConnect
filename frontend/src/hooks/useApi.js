// frontend/src/hooks/useApi.js
import { useEffect, useRef } from 'react';

/**
 * 🎓 MICROSOFT-GRADE OPTIMIZATION: Request Cancellation Hook
 *
 * Prevents memory leaks and duplicate API requests
 *
 * Features:
 * - Automatic request cancellation on component unmount
 * - Prevents race conditions
 * - Avoids memory leaks from pending requests
 *
 * Usage:
 * const abortController = useApi();
 *
 * const fetchData = async () => {
 *   try {
 *     const response = await api.get('/endpoint', {
 *       signal: abortController.signal
 *     });
 *   } catch (error) {
 *     if (error.name === 'AbortError' || error.name === 'CanceledError') {
 *       console.log('Request was cancelled');
 *       return;
 *     }
 *     // Handle other errors
 *   }
 * };
 */
export const useApi = () => {
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Create new AbortController on mount
    abortControllerRef.current = new AbortController();

    // Cleanup: Cancel all pending requests on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return abortControllerRef.current;
};

/**
 * 🎓 ADVANCED: Request Deduplication Hook
 *
 * Prevents duplicate API calls to the same endpoint
 * Useful for preventing multiple calls on rapid renders
 *
 * Usage:
 * const { loading, error, data, execute } = useApiCall(apiFunction);
 *
 * useEffect(() => {
 *   execute();
 * }, []);
 */
export const useApiCall = (apiFunction) => {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null,
  });

  const abortController = useApi();
  const pendingRequestRef = useRef(false);

  const execute = async (...args) => {
    // Skip if request already in progress
    if (pendingRequestRef.current) {
      console.log('Request already in progress, skipping...');
      return;
    }

    try {
      pendingRequestRef.current = true;
      setState({ loading: true, error: null, data: null });

      const result = await apiFunction(...args, {
        signal: abortController.signal,
      });

      setState({ loading: false, error: null, data: result.data });
      return result.data;
    } catch (error) {
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        // Request was cancelled, don't update state
        return;
      }
      setState({ loading: false, error, data: null });
      throw error;
    } finally {
      pendingRequestRef.current = false;
    }
  };

  return { ...state, execute };
};

export default useApi;
