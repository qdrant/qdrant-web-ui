import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Plus, Trash2, ChartSpline } from 'lucide-react';
import MetricChart from './MetricChart';
import AddSeriesField from './AddSeriesField';
import { seriesColor } from './colors';
import { PRESETS } from './presets';
import { useMetricsHistory } from '../../hooks/useMetricsHistory';
import { useScrollToId } from '../../hooks/useScrollToId';
import {
  listSeries,
  seriesLabel,
  buildSeriesKey,
  indexTypesByName,
  detectUnit,
  isCounter,
} from '../../lib/metrics-parser';

// todo (ai agents have to ignore this!): do the same for all hard-coded storage keys
const STORAGE_KEY = 'metricsDashboard.charts';
const POLL_INTERVAL_MS = 5000;
const MAX_POINTS = 120; // ~10 minutes at a 5s interval

// todo: looks like a good candidate to move to helpers and becoming a function (and maybe rename if
// moved, to express better what type of id it returns
const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}-${Math.random()}`;

const loadCharts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// A chart's series carry only { key, name, labels }; the human label is derived
// on render so it stays consistent with the parser's formatting.
const makeSeries = (name, labels = {}) => ({ key: buildSeriesKey(name, labels), name, labels });

// Series can share a chart only if they'd share a meaningful Y axis: the same
// display unit (bytes / seconds / count) and the same plotting kind (a gauge is
// drawn raw, a counter as a per-second rate). This groups them into a single
// compatibility bucket used to filter the in-chart "add metric" options.
const compatKey = (name, type) => `${detectUnit(name)}:${isCounter(type) ? 'rate' : 'raw'}`;

// DOM id for a chart card, so a freshly added chart can be scrolled into view.
const chartElementId = (chartId) => `metrics-chart-${chartId}`;

function MetricsDashboard() {
  const theme = useTheme();
  const [charts, setCharts] = useState(loadCharts);
  // Id of a just-added chart to scroll to once it mounts (cleared after).
  const [scrollToId, setScrollToId] = useState(null);
  const clearScrollTo = useCallback(() => setScrollToId(null), []);
  useScrollToId(scrollToId, { onScrolled: clearScrollTo });

  // Persist the dashboard layout so it survives reloads
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(charts));
    } catch {
      /* ignore quota / private-mode failures */
    }
  }, [charts]);

  // Every distinct series key referenced by any chart — the set we accumulate
  // history for.
  const subscribedKeys = useMemo(() => {
    const keys = new Set();
    charts.forEach((chart) => chart.series.forEach((s) => keys.add(s.key)));
    return [...keys];
  }, [charts]);

  const { snapshot, history, loading, error } = useMetricsHistory({
    subscribedKeys,
    intervalMs: POLL_INTERVAL_MS,
    maxPoints: MAX_POINTS,
  });

  const availableSeries = useMemo(() => listSeries(snapshot), [snapshot]);
  const typesByName = useMemo(() => indexTypesByName(snapshot), [snapshot]);

  const addChart = useCallback((title, series) => {
    const id = newId();
    setCharts((prev) => [...prev, { id, title, series }]);
    setScrollToId(chartElementId(id));
  }, []);

  // Create one chart from a list of staged series (the top-bar builder). The
  // title is the metric name, or "<name> +N" when several distinct metrics are
  // combined, so a multi-series chart still reads clearly in its header.
  const createChart = useCallback(
    (seriesList) => {
      if (!seriesList?.length) return;
      const names = [...new Set(seriesList.map((s) => s.name))];
      const title = names.length === 1 ? names[0] : `${names[0]} +${names.length - 1}`;
      addChart(
        title,
        seriesList.map((s) => makeSeries(s.name, s.labels))
      );
    },
    [addChart]
  );

  const addPreset = useCallback((preset) => {
    const created = preset.charts.map((chart) => ({
      id: newId(),
      title: chart.title,
      series: chart.metrics.map((name) => makeSeries(name)),
    }));
    setCharts((prev) => [...prev, ...created]);
    if (created.length) setScrollToId(chartElementId(created[created.length - 1].id));
  }, []);

  const removeChart = useCallback((chartId) => {
    setCharts((prev) => prev.filter((chart) => chart.id !== chartId));
  }, []);

  const addSeriesToChart = useCallback((chartId, series) => {
    setCharts((prev) =>
      prev.map((chart) => {
        if (chart.id !== chartId) return chart;
        if (chart.series.some((s) => s.key === series.key)) return chart; // no duplicates
        return { ...chart, series: [...chart.series, makeSeries(series.name, series.labels)] };
      })
    );
  }, []);

  const removeSeriesFromChart = useCallback((chartId, key) => {
    setCharts((prev) =>
      prev.map((chart) =>
        chart.id === chartId ? { ...chart, series: chart.series.filter((s) => s.key !== key) } : chart
      )
    );
  }, []);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Metrics
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Live cluster metrics, sampled every {POLL_INTERVAL_MS / 1000}s. Build your own charts or start from a
            preset.
          </Typography>
        </Box>
      </Box>

      {/* Presets */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        {PRESETS.map((preset) => (
          <Button
            key={preset.id}
            variant="outlined"
            size="small"
            startIcon={<Plus size={16} />}
            onClick={() => addPreset(preset)}
          >
            {preset.label}
          </Button>
        ))}
      </Stack>

      {/* Add-chart bar */}
      <Card variant="outlined" sx={{ mb: 3, p: 1.5 }}>
        <AddSeriesField options={availableSeries} onCreate={createChart} placeholder="Add a metric as a new chart…" />
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Charts */}
      {charts.length === 0 ? (
        <EmptyState loading={loading} />
      ) : (
        <Stack spacing={3}>
          {charts.map((chart) => {
            const chartSeries = chart.series.map((s) => ({
              ...s,
              label: seriesLabel(s),
              type: typesByName[s.name] || '',
            }));
            // Options for this chart's adder: drop series already on the chart,
            // and — once the chart has at least one series — keep only those
            // that share its unit and gauge/counter kind. An empty chart offers
            // everything.
            const existingKeys = new Set(chart.series.map((s) => s.key));
            const chartCompat = chart.series.length
              ? compatKey(chart.series[0].name, typesByName[chart.series[0].name])
              : null;
            const addOptions = availableSeries.filter(
              (option) =>
                !existingKeys.has(option.key) &&
                (chartCompat === null || compatKey(option.name, option.type) === chartCompat)
            );
            return (
              <Card
                key={chart.id}
                id={chartElementId(chart.id)}
                variant="outlined"
                // Leave room for the fixed AppBar when scrolled into view.
                sx={{ scrollMarginTop: (t) => t.spacing(10) }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.5,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {/* todo: move styles in `sx` if possible */}
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {chart.title}
                  </Typography>
                  <Tooltip title="Remove chart">
                    <IconButton size="small" onClick={() => removeChart(chart.id)} aria-label="Remove chart">
                      <Trash2 size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <CardContent>
                  <MetricChart series={chartSeries} history={history} />

                  <Divider sx={{ my: 2 }} />

                  {/* Series chips (left) double as the chart legend — each
                      filled with its line's color (matched by position). The
                      "+" adder is pinned to the bottom-right corner. */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    <Box sx={{ flexGrow: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                      {chartSeries.map((s, i) => {
                        const { main, contrastText } = seriesColor(theme, i);
                        return (
                          <Chip
                            key={s.key}
                            label={s.label}
                            size="small"
                            onDelete={() => removeSeriesFromChart(chart.id, s.key)}
                            sx={{
                              maxWidth: 320,
                              bgcolor: main,
                              color: contrastText,
                              '& .MuiChip-deleteIcon': {
                                color: contrastText,
                                opacity: 0.7,
                                '&:hover': { opacity: 1, color: contrastText },
                              },
                            }}
                          />
                        );
                      })}
                    </Box>
                    <Box sx={{ flexShrink: 0, width: 220 }}>
                      <AddSeriesField
                        variant="inline"
                        options={addOptions}
                        onAdd={(series) => addSeriesToChart(chart.id, series)}
                        placeholder="Add a metric…"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

function EmptyState({ loading }) {
  return (
    <Card variant="outlined" sx={{ py: 8 }}>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, textAlign: 'center', px: 2 }}
      >
        <ChartSpline size={40} strokeWidth={1.5} opacity={0.5} />
        <Typography variant="h6">No charts yet</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {loading
            ? 'Connecting to the metrics endpoint…'
            : 'Add a preset above, or search for a metric to create your first chart.'}
        </Typography>
      </Box>
    </Card>
  );
}

EmptyState.propTypes = {
  loading: PropTypes.bool,
};

export default MetricsDashboard;
