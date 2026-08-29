import { useEffect, useRef, useState } from 'react';

/**
 * Repeatedly invoke `onTick` while `enabled` is true, waiting for each tick
 * to settle before scheduling the next one so slow requests never pile up.
 *
 * @param {Object} options - hook options
 * @param {boolean} options.enabled - start/stop the auto refresh timer
 * @param {number} options.intervalMs - delay between tick completions
 * @param {Function} options.onTick - async callback fired on every tick
 * @return {{isRefreshing: boolean}} true while a tick is in flight
 */
export function useAutoRefresh({ enabled, intervalMs, onTick }) {
  const onTickRef = useRef(onTick);
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!enabled || intervalMs <= 0) {
      return;
    }

    let cancelled = false;
    let timeoutId;

    const tick = async () => {
      if (cancelled) {
        return;
      }
      setIsRefreshing(true);
      try {
        await onTickRef.current();
      } catch {
        // Background failures are silent; the next tick still runs.
      } finally {
        if (!cancelled) {
          setIsRefreshing(false);
          timeoutId = setTimeout(tick, intervalMs);
        }
      }
    };

    timeoutId = setTimeout(tick, 0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [enabled, intervalMs]);

  return { isRefreshing };
}