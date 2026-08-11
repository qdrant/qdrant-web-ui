import { useEffect, useRef, useState } from 'react';
import { axiosInstance as axios } from '../common/axios';
import { parsePrometheus, indexByKey } from '../lib/metrics-parser';

// Poll Qdrant's `/metrics` endpoint on an interval and accumulate a bounded,
// in-browser time series for the currently subscribed metrics.
//
// Qdrant exposes point-in-time Prometheus metrics rather than a time-series
// database, so — like a lightweight Grafana — we build the history client-side:
// every tick we timestamp the response and remember the value of each
// subscribed series. `subscribedKeys` is read through a ref so the interval
// always samples the latest set of series without being torn down and
// recreated whenever the dashboard changes.
//
// Returns:
//   snapshot   latest parsed metrics map (name -> descriptor), or null
//   history    [{ t, values: { seriesKey: number } }] oldest-first, capped
//   loading    true until the first response (success or failure) arrives
//   error      last error message, or null
export const useMetricsHistory = ({ subscribedKeys = [], intervalMs = 5000, maxPoints = 120 } = {}) => {
  const [snapshot, setSnapshot] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const keysRef = useRef(subscribedKeys);
  keysRef.current = subscribedKeys;

  useEffect(() => {
    let active = true;

    const tick = async () => {
      try {
        // The endpoint returns plain text, so bypass the shared JSON response
        // transform and keep the raw body.
        const response = await axios.get('/metrics', {
          responseType: 'text',
          transformResponse: [(data) => data],
          headers: { Accept: 'text/plain' },
        });
        if (!active) return;

        const parsed = parsePrometheus(response.data);
        const index = indexByKey(parsed);
        const values = {};
        for (const key of keysRef.current) {
          if (key in index) values[key] = index[key];
        }

        setSnapshot(parsed);
        setError(null);
        setHistory((prev) => {
          const next = [...prev, { t: Date.now(), values }];
          return next.length > maxPoints ? next.slice(next.length - maxPoints) : next;
        });
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.status?.error || err?.message || 'Failed to fetch metrics.');
      } finally {
        if (active) setLoading(false);
      }
    };

    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [intervalMs, maxPoints]);

  return { snapshot, history, loading, error };
};
