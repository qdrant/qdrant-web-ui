import { useEffect, useRef } from 'react';

const isPageHidden = () => typeof document !== 'undefined' && document.visibilityState === 'hidden';

/**
 * Periodically runs an async callback while `enabled`.
 *
 * - The next run is scheduled only after the previous one settles, so slow
 *   responses never overlap.
 * - Each run receives an AbortSignal, aborted when polling stops or the
 *   component unmounts, so in-flight requests are cancelled.
 * - Polling pauses while the page is hidden and runs immediately once it is
 *   visible again.
 * - Errors are swallowed: a failed run is retried by the next one.
 *
 * @param {function(AbortSignal): Promise<*>} callback - work to run on each tick
 * @param {Object} options
 * @param {boolean} options.enabled - whether polling is active
 * @param {number} options.interval - delay in ms between the end of a run and the start of the next
 */
export function usePolling(callback, { enabled, interval }) {
  // Kept in a ref so a new callback identity does not restart the polling cycle.
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return undefined;

    const controller = new AbortController();
    let timeout = null;
    let running = false;

    const schedule = () => {
      clearTimeout(timeout);
      timeout = isPageHidden() ? null : setTimeout(run, interval);
    };

    const run = async () => {
      if (running || controller.signal.aborted || isPageHidden()) return;
      running = true;
      try {
        await callbackRef.current(controller.signal);
      } catch {
        // Retried by the next run.
      } finally {
        running = false;
      }
      if (!controller.signal.aborted) schedule();
    };

    const handleVisibilityChange = () => {
      if (isPageHidden()) {
        clearTimeout(timeout);
        timeout = null;
      } else {
        // Data may be stale after the page was hidden, so refresh right away.
        run();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    schedule();

    return () => {
      controller.abort();
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, interval]);
}
