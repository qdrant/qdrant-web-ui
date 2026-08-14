import React, { useMemo } from 'react';
import { Alert, Box, Divider, Grid, Stack, Typography } from '@mui/material';
import MetricChart from './MetricChart';
import MetricBarChart from './MetricBarChart';
import LatencyHeatmap from './LatencyHeatmap';
import StatTile from './StatTile';
import PanelCard from './PanelCard';
import CustomChartsDashboard from './CustomChartsDashboard';
import { useMetricsHistory } from '../../hooks/useMetricsHistory';
import { listSeries, indexByKey, seriesLabel } from '../../lib/metrics-parser';

const POLL_INTERVAL_MS = 5000;
const MAX_POINTS = 120; // ~10 minutes at a 5s interval

// Big-number tiles (Grafana "stat" panels).
const STAT_TILES = [
  { label: 'Collections', key: 'collections_total' },
  { label: 'Vectors', key: 'collections_vector_total' },
  { label: 'Pending operations', key: 'pending_operations' },
  { label: 'Cluster peers', key: 'cluster_peers_total' },
];

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
  const { snapshot, history, loading, error } = useMetricsHistory({
    recordAll: true,
    intervalMs: POLL_INTERVAL_MS,
    maxPoints: MAX_POINTS,
  });

  const all = useMemo(() => listSeries(snapshot), [snapshot]);
  const latest = useMemo(() => indexByKey(snapshot), [snapshot]);

  const restSeries = useMemo(() => all.filter((s) => s.name === 'rest_responses_total'), [all]);
  const grpcSeries = useMemo(() => all.filter((s) => s.name === 'grpc_responses_total'), [all]);
  const memorySeries = useMemo(() => all.filter((s) => /^memory_.*_bytes$/.test(s.name)), [all]);
  const vectorSeries = useMemo(() => all.filter((s) => s.name === 'collections_vector_total'), [all]);

  // Bar chart: total REST requests summed per endpoint (latest snapshot).
  const requestsByEndpoint = useMemo(() => {
    const sums = {};
    restSeries.forEach((s) => {
      const endpoint = s.labels.endpoint || s.name;
      sums[endpoint] = (sums[endpoint] || 0) + (latest[s.key] || 0);
    });
    const entries = Object.entries(sums).sort((a, b) => b[1] - a[1]);
    return { labels: entries.map((e) => e[0]), values: entries.map((e) => e[1]) };
  }, [restSeries, latest]);

  // Latency-distribution heatmap: group the response-duration histogram's
  // `_bucket` series by their `le` boundary (across every endpoint/method/
  // status, matching Grafana's `sum by (le)`), ordered ascending.
  const latencyBuckets = useMemo(() => {
    const groups = new Map(); // le string -> { sec, keys[] }
    all
      .filter((s) => /_responses_duration_seconds_bucket$/.test(s.name) && s.labels.le !== undefined)
      .forEach((s) => {
        const le = s.labels.le;
        if (!groups.has(le)) groups.set(le, { sec: le === '+Inf' ? Infinity : Number(le), keys: [] });
        groups.get(le).keys.push(s.key);
      });
    return [...groups.entries()]
      .sort((a, b) => a[1].sec - b[1].sec)
      .map(([, g]) => ({ label: formatLe(g.sec), keys: g.keys }));
  }, [all]);

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

      {/* Stat tiles */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {STAT_TILES.map((tile) => (
          <Grid key={tile.key} size={{ xs: 6, sm: 3 }}>
            <StatTile label={tile.label} value={loading ? undefined : latest[tile.key]} />
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Stack spacing={3}>
        <PanelCard title="REST request rate" subtitle="Requests per second, by endpoint and status">
          <MetricChart series={toChartSeries(restSeries)} history={history} showLegend />
        </PanelCard>

        <PanelCard
          title="Latency distribution"
          subtitle="Response time by bucket, requests/s (from the duration histogram)"
        >
          <LatencyHeatmap buckets={latencyBuckets} history={history} />
        </PanelCard>

        <PanelCard title="gRPC request rate" subtitle="Requests per second, by endpoint">
          <MetricChart series={toChartSeries(grpcSeries)} history={history} />
        </PanelCard>

        <PanelCard title="Total requests by endpoint" subtitle="Cumulative REST responses">
          <MetricBarChart labels={requestsByEndpoint.labels} values={requestsByEndpoint.values} />
        </PanelCard>

        <PanelCard title="Approximate vector count" subtitle="Total vectors across collections">
          <MetricChart series={toChartSeries(vectorSeries)} history={history} />
        </PanelCard>

        <PanelCard title="Memory usage">
          <MetricChart series={toChartSeries(memorySeries)} history={history} />
        </PanelCard>
      </Stack>

      {/* TEMPORARY: the earlier custom-chart builder, reconnected at the end of
          the page. Embedded (its own page header suppressed). */}
      <Divider sx={{ my: 4 }} />
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" component="h2">
          Custom charts
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Build an ad-hoc chart from any exposed metric.
        </Typography>
      </Box>
      <CustomChartsDashboard embedded />
    </Box>
  );
}

export default MetricsDashboard;
