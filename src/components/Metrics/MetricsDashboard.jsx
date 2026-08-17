import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Grid, Stack, Tab, Tabs, Typography } from '@mui/material';
import MetricChart from './MetricChart';
import LatencyHeatmap from './LatencyHeatmap';
import StatTile from './StatTile';
import PanelCard from './PanelCard';
import MetricsScope from './MetricsScope';
import { useClient } from '../../context/client-context';
import { useMetricsHistory } from '../../hooks/useMetricsHistory';
import { listSeries, indexByKey, seriesLabel } from '../../lib/metrics-parser';

const POLL_INTERVAL_MS = 5000;
// The timeline grows for the whole session; this is only a memory safety limit
// (beyond it the oldest history is decimated — see useMetricsHistory).
const MAX_STORED_POINTS = 3000;

// Big-number tiles for the Requests tab, keyed by `requestStats` fields.
const REQUEST_TILES = [
  { label: 'Requests/s', stat: 'rate' },
  { label: 'Avg latency', stat: 'avgLatency', unit: 'seconds' },
  { label: 'Error rate', stat: 'errorRate', unit: 'percent' },
  { label: 'Total requests', stat: 'total' },
];

const sumKeys = (values, keys) => keys.reduce((acc, k) => acc + (typeof values?.[k] === 'number' ? values[k] : 0), 0);

const hasCollectionLabel = (entries) => entries.some((s) => s.labels.collection !== undefined);

// CORS preflights: the browser sends one before most requests the UI makes, so
// counting them doubles the traffic and drags the latency stats down.
const isPreflight = (s) => s.labels.method === 'OPTIONS';

// Narrow a family of series to one collection. Qdrant only labels the request
// counters per collection, so a family without the label (the duration
// histogram, for one) stays instance-wide and is returned untouched.
const scopeToCollection = (entries, collection) =>
  collection && hasCollectionLabel(entries) ? entries.filter((s) => s.labels.collection === collection) : entries;

// Growth of a set of counters between two history points, or undefined when
// there is no usable interval (too few samples, a gap, or a counter reset).
const counterDelta = (history, keys, from, to) => {
  if (!keys.length || !history[from] || !history[to]) return undefined;
  const dt = (history[to].t - history[from].t) / 1000;
  const dv = sumKeys(history[to].values, keys) - sumKeys(history[from].values, keys);
  if (dt <= 0 || dv < 0) return undefined;
  return { dv, dt };
};

// Format a histogram `le` bucket boundary (seconds) as a short latency label.
const formatLe = (sec) => {
  if (!Number.isFinite(sec)) return '+Inf';
  if (sec < 1) return `${Math.round(sec * 1000)}ms`;
  return `${sec}s`;
};

// Turn parsed series descriptors into the shape MetricChart consumes.
const toChartSeries = (entries) =>
  entries.map((s) => ({ key: s.key, name: s.name, labels: s.labels, label: seriesLabel(s), type: s.type }));

// The Metrics page: a fixed set of panels, auto-populated from Qdrant's
// /metrics endpoint with no user interaction. Panel types mirror Qdrant's
// Grafana dashboards (github.com/qdrant/prometheus-monitoring), bound to the
// metrics a self-hosted instance actually exposes.
function MetricsDashboard() {
  const [currentTab, setCurrentTab] = useState('requests');
  const [scope, setScope] = useState('global');
  const [collection, setCollection] = useState('');
  const [collections, setCollections] = useState([]);
  const { client: qdrantClient } = useClient();

  const perCollection = scope === 'collection';
  // Only filter once a collection is picked, so the panels never silently show
  // instance-wide numbers under a collection heading.
  const activeCollection = perCollection ? collection : '';

  const { snapshot, history, error } = useMetricsHistory({
    recordAll: true,
    intervalMs: POLL_INTERVAL_MS,
    maxPoints: MAX_STORED_POINTS,
    perCollection,
  });

  // The collection choice is mandatory in per-collection mode, so preselect the
  // first one and keep the selection valid as collections come and go.
  useEffect(() => {
    if (!perCollection) return undefined;
    let active = true;
    qdrantClient
      .getCollections()
      .then(({ collections: found }) => {
        if (!active) return;
        const names = found.map((c) => c.name).sort((a, b) => a.localeCompare(b));
        setCollections(names);
        setCollection((current) => (names.includes(current) ? current : names[0] || ''));
      })
      .catch(() => active && setCollections([]));
    return () => {
      active = false;
    };
  }, [perCollection, qdrantClient]);

  const all = useMemo(() => listSeries(snapshot), [snapshot]);
  const latest = useMemo(() => indexByKey(snapshot), [snapshot]);

  const restAll = useMemo(() => all.filter((s) => s.name === 'rest_responses_total' && !isPreflight(s)), [all]);
  const restSeries = useMemo(() => scopeToCollection(restAll, activeCollection), [restAll, activeCollection]);

  // Qdrant ignores `per_collection` on older versions, and when the feature is
  // disabled in its config: the counters stay instance-wide. Say so rather than
  // passing those numbers off as one collection's.
  const perCollectionUnsupported = Boolean(activeCollection) && restAll.length > 0 && !hasCollectionLabel(restAll);

  // Latency-distribution heatmap: group the response-duration histogram's
  // `_bucket` series by their `le` boundary (across every endpoint/method/
  // status, matching Grafana's `sum by (le)`), ordered ascending.
  const bucketSeries = useMemo(
    () =>
      all.filter(
        (s) => /_responses_duration_seconds_bucket$/.test(s.name) && s.labels.le !== undefined && !isPreflight(s)
      ),
    [all]
  );

  const latencyBuckets = useMemo(() => {
    const groups = new Map(); // le string -> { sec, keys[] }
    scopeToCollection(bucketSeries, activeCollection).forEach((s) => {
      const le = s.labels.le;
      if (!groups.has(le)) groups.set(le, { sec: le === '+Inf' ? Infinity : Number(le), keys: [] });
      groups.get(le).keys.push(s.key);
    });
    return [...groups.entries()]
      .sort((a, b) => a[1].sec - b[1].sec)
      .map(([, g]) => ({ label: formatLe(g.sec), keys: g.keys }));
  }, [bucketSeries, activeCollection]);

  // Qdrant may report the duration histogram instance-wide even in
  // per-collection mode; say so rather than implying the panel is filtered.
  const latencyIsGlobal = Boolean(activeCollection) && !hasCollectionLabel(bucketSeries);

  // Each scope keeps its own history buffer (see useMetricsHistory), so `history`
  // already holds only this scope's points. This still drops any point taken
  // before the selected series existed — e.g. a collection created mid-session —
  // so a counter delta is never measured against a missing value and read as an
  // enormous spike.
  const requestsHistory = useMemo(() => {
    const keys = [...restSeries.map((s) => s.key), ...latencyBuckets.flatMap((b) => b.keys)];
    if (!keys.length) return history;
    return history.filter((point) => keys.some((key) => point.values[key] != null));
  }, [history, restSeries, latencyBuckets]);

  // Stats for the Requests tab: throughput right now, average latency across
  // the retained window (total time spent / requests served, from the duration
  // histogram) and the lifetime totals behind the error share.
  const requestStats = useMemo(() => {
    const restKeys = restSeries.map((s) => s.key);
    const errorKeys = restSeries.filter((s) => /^[45]/.test(s.labels.status || '')).map((s) => s.key);
    const keysEndingIn = (suffix) =>
      scopeToCollection(
        all.filter((s) => s.name.endsWith(`_responses_duration_seconds_${suffix}`) && !isPreflight(s)),
        activeCollection
      ).map((s) => s.key);
    const spentKeys = keysEndingIn('sum');
    const servedKeys = keysEndingIn('count');
    const avgOf = (spent, served) => (served > 0 ? spent / served : undefined);

    const last = requestsHistory.length - 1;
    const throughput = counterDelta(requestsHistory, restKeys, last - 1, last);
    const spent = counterDelta(requestsHistory, spentKeys, 0, last);
    const served = counterDelta(requestsHistory, servedKeys, 0, last);
    const total = sumKeys(latest, restKeys);

    return {
      rate: throughput ? throughput.dv / throughput.dt : undefined,
      // Average over the window when there was traffic in it, otherwise the
      // instance's lifetime average so an idle instance still shows a value.
      avgLatency:
        (spent && served && avgOf(spent.dv, served.dv)) ??
        avgOf(sumKeys(latest, spentKeys), sumKeys(latest, servedKeys)),
      errorRate: total > 0 ? (sumKeys(latest, errorKeys) / total) * 100 : undefined,
      total: restKeys.length ? total : undefined,
    };
  }, [restSeries, all, latest, requestsHistory, activeCollection]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Metrics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Live cluster metrics from the Qdrant <code>/metrics</code> endpoint, sampled every {POLL_INTERVAL_MS / 1000}s.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Charts, grouped by tab, for the instance or a single collection. Below
          lg the scope control drops to its own row so toggling "Per collection"
          (wider than "Global") never reflows the tabs. */}
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        alignItems={{ xs: 'flex-start', lg: 'center' }}
        justifyContent="space-between"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, gap: 2 }}
      >
        <Tabs value={currentTab} onChange={(e, tab) => setCurrentTab(tab)} aria-label="Metrics tabs">
          <Tab label="Requests" value="requests" />
          <Tab label="Collections" value="collections" />
          <Tab label="Memory & CPU" value="resources" />
        </Tabs>
        <Box sx={{ pb: 1 }}>
          <MetricsScope
            scope={scope}
            onScopeChange={setScope}
            collection={collection}
            collections={collections}
            onCollectionChange={setCollection}
          />
        </Box>
      </Stack>

      {currentTab === 'requests' && perCollection && !collection && (
        <Alert severity="info">Select a collection to see its request metrics.</Alert>
      )}

      {currentTab === 'requests' && !(perCollection && !collection) && (
        <Stack spacing={3}>
          {perCollectionUnsupported && (
            <Alert severity="warning">
              This Qdrant reports request metrics instance-wide, so the panels below are not filtered by collection.
            </Alert>
          )}

          <Grid container spacing={2}>
            {REQUEST_TILES.map((tile) => (
              <Grid key={tile.stat} size={{ xs: 6, sm: 3 }}>
                <StatTile label={tile.label} value={requestStats[tile.stat]} unit={tile.unit} />
              </Grid>
            ))}
          </Grid>

          <PanelCard
            title="Request Rate"
            subtitle={`Total requests per second, all endpoints and statuses${
              activeCollection && !perCollectionUnsupported ? ` · ${activeCollection}` : ''
            }`}
          >
            <MetricChart
              series={toChartSeries(restSeries)}
              history={requestsHistory}
              aggregate
              aggregateLabel="Requests"
            />
          </PanelCard>

          <PanelCard
            title="Latency distribution"
            subtitle={`Response time by bucket, requests/s (from the duration histogram)${
              latencyIsGlobal ? ' · all collections' : ''
            }`}
          >
            <LatencyHeatmap buckets={latencyBuckets} history={requestsHistory} />
          </PanelCard>
        </Stack>
      )}
    </Box>
  );
}

export default MetricsDashboard;
