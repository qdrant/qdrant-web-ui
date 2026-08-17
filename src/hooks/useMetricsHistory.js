import { useEffect, useRef, useState } from 'react';
import { axiosInstance as axios } from '../common/axios';
import { parsePrometheus, indexByKey } from '../lib/metrics-parser';

// The timeline grows for the whole session (charts show everything since the
// page opened). To keep memory bounded on very long, days-long sessions, once a
// buffer exceeds `limit` points we halve the resolution of its OLDEST half —
// preserving the full time span and recent full-resolution detail while shedding
// points. Rates are computed from deltas, so coarser old spacing stays correct.
const boundHistory = (points, limit) => {
  if (points.length <= limit) return points;
  const half = points.length >> 1;
  const older = points.slice(0, half).filter((_, i) => i % 2 === 0);
  return [...older, ...points.slice(half)];
};

// Poll Qdrant's `/metrics` endpoint on an interval and accumulate an in-browser
// time series for the currently subscribed metrics. The history grows for the
// whole session (charts show everything since the page opened); `maxPoints` is
// only a memory safety limit past which the oldest points are decimated.
//
// Qdrant exposes point-in-time Prometheus metrics rather than a time-series
// database, so — like a lightweight Grafana — we build the history client-side:
// every tick we timestamp the response and remember the value of each
// subscribed series. `subscribedKeys` is read through a ref so the interval
// always samples the latest set of series without being torn down and
// recreated whenever the dashboard changes.
//
// Pass `recordAll: true` to accumulate history for every series in each
// response (used by the preset dashboard, which charts whatever the server
// exposes); otherwise only `subscribedKeys` are recorded.
//
// Pass `perCollection: true` to request `/metrics?per_collection=true`, where
// Qdrant labels the response metrics with the collection they belong to instead
// of reporting them cluster-wide.
//
// The two poll modes ("global" and per-collection) return different series, so
// each keeps its OWN history buffer. Switching between them resumes the target
// mode's buffer where it left off — nothing is lost, the timelines never
// interleave, and one mode's samples can't evict the other's from a shared cap.
//
// Returns:
//   snapshot   latest parsed metrics map (name -> descriptor), or null
//   history    [{ t, values: { seriesKey: number } }] oldest-first, growing
//   loading    true until the first response (success or failure) arrives
//   error      last error message, or null
export const useMetricsHistory = ({
  subscribedKeys = [],
  recordAll = false,
  intervalMs = 5000,
  maxPoints = 3000,
  perCollection = false,
} = {}) => {
  const [snapshot, setSnapshot] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const keysRef = useRef(subscribedKeys);
  keysRef.current = subscribedKeys;
  const recordAllRef = useRef(recordAll);
  recordAllRef.current = recordAll;

  // One history buffer per poll mode, preserved across the component's life.
  const buffersRef = useRef({});

  useEffect(() => {
    let active = true;
    const mode = perCollection ? 'collection' : 'global';

    // Resume this mode's buffer (empty on first visit); the other mode's buffer
    // is left untouched. The snapshot is dropped so nothing reads the previous
    // mode's series until the first response of the new one lands.
    setSnapshot(null);
    setLoading(true);
    setHistory(buffersRef.current[mode] || []);

    const tick = async () => {
      try {
        // The endpoint returns plain text, so bypass the shared JSON response
        // transform and keep the raw body.
        const response = await axios.get('/metrics', {
          responseType: 'text',
          transformResponse: [(data) => data],
          headers: { Accept: 'text/plain' },
          params: perCollection ? { per_collection: true } : undefined,
        });
        if (!active) return;

        const parsed = parsePrometheus(response.data);
        const index = indexByKey(parsed);
        let values;
        if (recordAllRef.current) {
          values = index;
        } else {
          values = {};
          for (const key of keysRef.current) {
            if (key in index) values[key] = index[key];
          }
        }

        const prev = buffersRef.current[mode] || [];
        const bounded = boundHistory([...prev, { t: Date.now(), values }], maxPoints);
        buffersRef.current[mode] = bounded;

        setSnapshot(parsed);
        setError(null);
        setHistory(bounded);
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
  }, [intervalMs, maxPoints, perCollection]);

  return { snapshot, history, loading, error };
};
