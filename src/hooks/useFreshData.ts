import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook that calls a fetch function:
 * 1. On initial mount
 * 2. Every time the route path changes (navigating away and back)
 * 3. When the browser tab regains focus (user switches back)
 * 4. Optionally on a polling interval
 *
 * This ensures data shown on the page is always fresh without manual refresh.
 */
export function useFreshData(
  fetchFn: () => void | Promise<void>,
  options: {
    /** Extra dependencies that should trigger a re-fetch */
    deps?: unknown[];
    /** Re-fetch when tab regains focus. Default: true */
    refetchOnFocus?: boolean;
    /** Polling interval in ms. 0 = no polling. Default: 0 */
    pollingInterval?: number;
  } = {}
) {
  const { deps = [], refetchOnFocus = true, pollingInterval = 0 } = options;
  const location = useLocation();
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  // Re-fetch on mount + route change + dependency change
  useEffect(() => {
    fetchRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, ...deps]);

  // Re-fetch when browser tab regains focus
  useEffect(() => {
    if (!refetchOnFocus) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchRef.current();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetchOnFocus]);

  // Optional polling
  useEffect(() => {
    if (!pollingInterval || pollingInterval <= 0) return;
    const id = setInterval(() => fetchRef.current(), pollingInterval);
    return () => clearInterval(id);
  }, [pollingInterval]);
}
