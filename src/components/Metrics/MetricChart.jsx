import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Chart from 'chart.js/auto';
import { formatValue, detectUnit, isCounter, toRatePerSecond } from '../../lib/metrics-parser';
import { seriesColor } from './colors';

const formatTick = (t) =>
  new Date(t).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const formatStat = (value, unit, rate) => (value == null ? '—' : `${formatValue(value, unit)}${rate ? '/s' : ''}`);

// A single time-series line chart rendering one or more metric series that
// share an X axis (the poll timestamps accumulated by useMetricsHistory).
// Pass `showLegend` to render the Grafana-style table legend (Name / Mean / Max)
// below the chart; clicking a row toggles that series.
const MetricChart = ({ series, history = false }) => {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [hidden] = useState(() => new Set());

  // Signature that identifies the current set of series; a change means the
  // chart's datasets must be rebuilt rather than merely re-fed with data. The
  // type is part of it so the chart rebuilds once the first snapshot resolves a
  // series' type (gauge vs counter changes how it's plotted and labelled).
  const seriesSignature = useMemo(() => series.map((s) => `${s.key}:${s.type || ''}`).join('|'), [series]);
  const hiddenSignature = [...hidden].join('|');
  // The Y axis carries a single unit; use the first series' unit for it while
  // tooltips format each point by its own unit.
  const axisUnit = series.length ? detectUnit(series[0].name) : 'number';
  // Counters are shown as a per-second rate; only append the "/s" axis suffix
  // when every series on the chart is a rate (a mixed chart is left unsuffixed).
  const allRate = series.length > 0 && series.every((s) => isCounter(s.type));

  // The plotted values for a series: a rate for counters, the raw value for
  // gauges. Shared by the render effect and the "has any data yet" check so a
  // counter isn't considered ready until it has two points to derive a rate.
  const computeData = (s) => {
    const points = history.map((point) => ({ t: point.t, v: point.values[s.key] ?? null }));
    return isCounter(s.type) ? toRatePerSecond(points) : points.map((point) => point.v);
  };

  // (Re)create the chart when the series set or the theme mode changes.
  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const gridColor = theme.palette.divider;
    const textColor = theme.palette.text.secondary;

    const chart = new Chart(canvasRef.current.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: series.map((s, i) => ({
          label: isCounter(s.type) ? `${s.label} (rate)` : s.label,
          data: [],
          unit: detectUnit(s.name),
          rate: isCounter(s.type),
          borderColor: seriesColor(theme, i).main,
          backgroundColor: seriesColor(theme, i).main,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.3,
          spanGaps: true,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          // The custom table legend below (or the dashboard's chips) is the
          // legend; chart.js's own legend stays off.
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                `${ctx.dataset.label}: ${formatValue(ctx.parsed.y, ctx.dataset.unit)}${ctx.dataset.rate ? '/s' : ''}`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: gridColor, display: false },
            ticks: { color: textColor, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 },
          },
          y: {
            grid: { color: gridColor },
            border: { display: false },
            ticks: {
              color: textColor,
              maxTicksLimit: 5,
              callback: (value) => `${formatValue(value, axisUnit)}${allRate ? '/s' : ''}`,
            },
          },
        },
      },
    });
    chartRef.current = chart;
    return () => {
      chart.destroy();
      chartRef.current = null;
    };
  }, [seriesSignature, theme.palette.mode]);

  // Feed the accumulated history into the existing chart on every poll, and
  // apply per-series visibility toggled from the legend.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.labels = history.map((point) => formatTick(point.t));
    series.forEach((s, i) => {
      if (chart.data.datasets[i]) {
        chart.data.datasets[i].data = computeData(s);
        chart.data.datasets[i].hidden = hidden.has(s.key);
      }
    });
    chart.update('none');
  }, [history, seriesSignature, hiddenSignature]);

  const hasData = series.some((s) => computeData(s).some((v) => v != null));

  return (
    <>
      <Box sx={{ position: 'relative', height: 240, width: '100%' }}>
        <canvas ref={canvasRef} />
        {!hasData && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Collecting data…
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
};

MetricChart.propTypes = {
  series: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.string,
    })
  ).isRequired,
  history: PropTypes.array.isRequired,
  showLegend: PropTypes.bool,
};

// Grafana-style table legend: colored line marker + name, with right-aligned
// Mean/Max stat columns. Scrolls when there are many series; clicking a row
// toggles that series on the chart.
const STAT_WIDTH = 96;
const MARKER_SLOT = 22;

function ChartLegend({ rows, hidden, onToggle }) {
  const theme = useTheme();
  const headColor = theme.palette.primary.main;
  const statCell = {
    width: STAT_WIDTH,
    flexShrink: 0,
    pl: 1,
    textAlign: 'right',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  };

  return (
    <Box sx={{ mt: 1.5, maxHeight: 168, overflowY: 'auto', fontSize: 13, lineHeight: 1.6 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 0.5,
          py: 0.25,
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ width: MARKER_SLOT, flexShrink: 0 }} />
        <Box sx={{ flexGrow: 1, minWidth: 0, color: headColor, fontWeight: 600 }}>Name</Box>
        <Box sx={{ ...statCell, color: headColor, fontWeight: 600 }}>Mean</Box>
        <Box sx={{ ...statCell, color: headColor, fontWeight: 600 }}>Max</Box>
      </Box>
      {rows.map((row) => {
        const isHidden = hidden.has(row.key);
        return (
          <Box
            key={row.key}
            onClick={() => onToggle(row.key)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 0.5,
              py: 0.25,
              cursor: 'pointer',
              borderRadius: 1,
              opacity: isHidden ? 0.4 : 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Box sx={{ width: MARKER_SLOT, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 14, height: 3, borderRadius: 1, bgcolor: row.color }} />
            </Box>
            <Typography
              variant="body2"
              noWrap
              sx={{ flexGrow: 1, minWidth: 0, textDecoration: isHidden ? 'line-through' : 'none' }}
            >
              {row.label}
            </Typography>
            <Box sx={{ ...statCell, color: 'text.secondary' }}>{formatStat(row.mean, row.unit, row.rate)}</Box>
            <Box sx={{ ...statCell, color: 'text.secondary' }}>{formatStat(row.max, row.unit, row.rate)}</Box>
          </Box>
        );
      })}
    </Box>
  );
}

ChartLegend.propTypes = {
  rows: PropTypes.array.isRequired,
  hidden: PropTypes.instanceOf(Set).isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default MetricChart;
