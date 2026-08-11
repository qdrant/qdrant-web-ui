import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Chart from 'chart.js/auto';
import { formatValue, detectUnit, isCounter, toRatePerSecond } from '../../lib/metrics-parser';
import { seriesColor } from './colors';

const formatTick = (t) =>
  new Date(t).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

// A single time-series line chart rendering one or more metric series that
// share an X axis (the poll timestamps accumulated by useMetricsHistory).
const MetricChart = ({ series, history }) => {
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
          // The legend is intentionally off — the metric chips below the chart
          // carry the same colors and serve as an interactive legend.
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

  // Feed the accumulated history into the existing chart on every poll.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.labels = history.map((point) => formatTick(point.t));
    series.forEach((s, i) => {
      if (chart.data.datasets[i]) {
        chart.data.datasets[i].data = computeData(s);
      }
    });
    chart.update('none');
  }, [history, seriesSignature, series]);

  const hasData = series.some((s) => computeData(s).some((v) => v != null));

  return (
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
};

export default MetricChart;
