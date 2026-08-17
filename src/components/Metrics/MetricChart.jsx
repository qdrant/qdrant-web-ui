import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Chart from 'chart.js/auto';
import { formatValue, detectUnit, isCounter, toRatePerSecond } from '../../lib/metrics-parser';
import { seriesColor } from './colors';
import CollectingOverlay from './CollectingOverlay';

const formatTick = (t) =>
  new Date(t).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

// A single time-series line chart rendering one or more metric series that
// share an X axis (the poll timestamps accumulated by useMetricsHistory).
// Pass `aggregate` to collapse every series into one line: the counters are
// summed per timestamp and rated once — i.e. `rate(sum(...))`, the same as
// dropping the per-request labels and treating them as one series.
// Pass `showLegend` to render chart.js's built-in legend below the chart —
// useful when several distinct series share it (e.g. memory, disk read/write).
const MetricChart = ({
  series,
  history = [],
  aggregate = false,
  aggregateLabel = 'Total',
  showLegend = false,
  beginAtZero = false,
}) => {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  // Signature that identifies the current set of series; a change means the
  // chart's datasets must be rebuilt rather than merely re-fed with data. The
  // type is part of it so the chart rebuilds once the first snapshot resolves a
  // series' type (gauge vs counter changes how it's plotted and labelled).
  const seriesSignature = useMemo(() => series.map((s) => `${s.key}:${s.type || ''}`).join('|'), [series]);
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

  // Aggregate: sum the raw counter values across all series at each timestamp
  // into one synthetic counter, then take a single rate. This is exactly
  // "erase the per-request labels and treat them as one series" — `rate(sum(x))`.
  // Within a scope the series set is stable, so it equals `sum(rate(x))` but is
  // simpler; toRatePerSecond still drops the first point and any counter reset.
  const computeTotal = () => {
    const summed = history.map((point) => ({
      t: point.t,
      v: series.reduce((sum, s) => {
        const value = point.values[s.key];
        return typeof value === 'number' ? sum + value : sum;
      }, 0),
    }));
    return toRatePerSecond(summed);
  };

  const datasetsData = () => (aggregate ? [computeTotal()] : series.map(computeData));

  // One dataset per series, or a single summed one in aggregate mode.
  const lines = aggregate
    ? [{ label: allRate ? `${aggregateLabel} (rate)` : aggregateLabel, unit: axisUnit, rate: allRate }]
    : series.map((s) => ({
        label: isCounter(s.type) ? `${s.label} (rate)` : s.label,
        unit: detectUnit(s.name),
        rate: isCounter(s.type),
      }));

  // (Re)create the chart when the series set or the theme mode changes.
  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const gridColor = theme.palette.divider;
    const textColor = theme.palette.text.secondary;

    const chart = new Chart(canvasRef.current.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: lines.map((line, i) => ({
          label: line.label,
          data: [],
          unit: line.unit,
          rate: line.rate,
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
          legend: showLegend
            ? {
                display: true,
                position: 'bottom',
                labels: { color: textColor, boxWidth: 12, boxHeight: 12, usePointStyle: true, padding: 16 },
              }
            : { display: false },
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
            // Rates and other non-negative metrics anchor the axis at zero so the
            // line never dips below it (e.g. CPU usage can't be negative).
            min: beginAtZero ? 0 : undefined,
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
  }, [seriesSignature, theme.palette.mode, aggregate, aggregateLabel, showLegend, beginAtZero]);

  // Feed the accumulated history into the existing chart on every poll, and
  // apply per-series visibility toggled from the legend.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.labels = history.map((point) => formatTick(point.t));
    datasetsData().forEach((data, i) => {
      if (!chart.data.datasets[i]) return;
      chart.data.datasets[i].data = data;
    });
    chart.update('none');
  }, [history, seriesSignature, aggregate]);

  const hasData = datasetsData().some((data) => data.some((v) => v != null));

  return (
    <>
      <Box sx={{ position: 'relative', height: 240, width: '100%' }}>
        <canvas ref={canvasRef} />
        {!hasData && <CollectingOverlay />}
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
  history: PropTypes.array,
  aggregate: PropTypes.bool,
  aggregateLabel: PropTypes.string,
  showLegend: PropTypes.bool,
  beginAtZero: PropTypes.bool,
};

export default MetricChart;
