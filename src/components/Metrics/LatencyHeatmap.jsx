import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Chart from 'chart.js/auto';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import { formatValue } from '../../lib/metrics-parser';
import CollectingOverlay from './CollectingOverlay';

// The matrix chart type isn't part of chart.js/auto, so register it once.
Chart.register(MatrixController, MatrixElement);

// The timeline grows for the whole session; aggregate it into at most this many
// columns so cells stay readable however long the page stays open.
const TARGET_COLUMNS = 60;

const formatTick = (t) =>
  new Date(t).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

// Parse a CSS color ('#rgb', '#rrggbb' or 'rgb(r,g,b)') into [r, g, b].
const toRgb = (str) => {
  if (typeof str === 'string' && str[0] === '#') {
    let hex = str.slice(1);
    if (hex.length === 3)
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    const n = parseInt(hex.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = String(str).match(/\d+(\.\d+)?/g);
  return m ? [Number(m[0]), Number(m[1]), Number(m[2])] : [0, 0, 0];
};

const lerp = (a, b, t) => Math.round(a + (b - a) * t);
const blend = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rgbStr = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`;
const mix = (lo, hi, t) => rgbStr(blend(lo, hi, t));

// A sequential single-hue ramp built from the theme primary color: a pale tint
// for low values and a deep shade for high ones. The bright end maps to high
// values, so it flips with the theme (bright stands out on dark backgrounds).
const primaryRamp = (theme) => {
  const base = toRgb(theme.palette.primary.main);
  const light = blend(base, [255, 255, 255], 0.72); // pale primary
  const deep = blend(base, [0, 0, 0], 0.35); // deep primary
  return theme.palette.mode === 'dark' ? { lo: deep, hi: light } : { lo: light, hi: deep };
};

const fmtRate = (v) => {
  if (!v) return '0/s';
  // Small rates keep 3 significant figures (e.g. 0.0000724/s); larger ones use
  // the grouped-digit formatter.
  const n = v < 1 ? Number(v.toPrecision(3)) : formatValue(v, 'number');
  return `${n}/s`;
};

// The Grafana "Latency Distribution" heatmap: Y = response-time buckets, X =
// time, cell color = the per-second rate of requests landing in that latency
// band. Reads Qdrant's `*_responses_duration_seconds` Prometheus histogram —
// `buckets` are the `le` groups (ascending) with the series keys per bucket, and
// history holds their cumulative counts, which we un-cumulate and rate here.
const LatencyHeatmap = ({ buckets, history }) => {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const bucketsSig = buckets.map((b) => b.label).join('|');

  // Build the matrix cells and the value range once, shared by the chart (for
  // color scaling) and the gradient legend (for its min/max labels).
  const matrix = useMemo(() => {
    const n = history.length;
    const rowLabels = buckets.map((b) => b.label);
    const empty = {
      labels: [],
      rowLabels,
      data: [],
      min: 0,
      max: 0,
      cols: 1,
      nRows: Math.max(rowLabels.length, 1),
      hasData: false,
    };
    if (n < 2 || buckets.length === 0) return empty;

    // Cumulative count per bucket at one history point (summed across the series
    // that share each `le`, e.g. all endpoints/methods/statuses).
    const cumAt = (point) =>
      buckets.map((b) =>
        b.keys.reduce((sum, key) => sum + (typeof point.values[key] === 'number' ? point.values[key] : 0), 0)
      );

    // Aggregate the whole (growing) timeline into at most TARGET_COLUMNS columns:
    // pick evenly spaced boundary points and rate each column over the span
    // between them. As history grows a column just covers more polls, so cells
    // never shrink to slivers.
    const columns = Math.min(TARGET_COLUMNS, n - 1);
    const boundaries = [];
    for (let j = 0; j <= columns; j++) boundaries.push(Math.round((j * (n - 1)) / columns));
    const cums = boundaries.map((idx) => cumAt(history[idx]));

    // Un-cumulate consecutive `le` into per-band counts, then rate the column's
    // span — the average requests/s that fell in each band over that window.
    const data = [];
    const labels = [];
    let min = Infinity;
    let max = 0;
    for (let j = 0; j < columns; j++) {
      const dt = (history[boundaries[j + 1]].t - history[boundaries[j]].t) / 1000;
      const label = formatTick(history[boundaries[j + 1]].t);
      labels.push(label);
      for (let i = 0; i < buckets.length; i++) {
        const bandNow = cums[j + 1][i] - (i > 0 ? cums[j + 1][i - 1] : 0);
        const bandPrev = cums[j][i] - (i > 0 ? cums[j][i - 1] : 0);
        let rate = dt > 0 ? (bandNow - bandPrev) / dt : 0;
        if (!Number.isFinite(rate) || rate < 0) rate = 0; // counter reset / gap
        // Every cell is drawn (so the grid shows), but empty ones (rate 0) get a
        // transparent fill and a border; only non-zero rates drive the color
        // scale / legend.
        data.push({ x: label, y: rowLabels[i], v: rate });
        if (rate > 0) {
          if (rate < min) min = rate;
          if (rate > max) max = rate;
        }
      }
    }
    return {
      labels,
      rowLabels,
      data,
      // Color scale / legend span the observed non-zero range (like Grafana),
      // not from zero.
      min: Number.isFinite(min) ? min : 0,
      max,
      cols: Math.max(labels.length, 1),
      nRows: Math.max(rowLabels.length, 1),
      hasData: labels.length > 0,
    };
  }, [history, buckets]);

  const ramp = useMemo(() => primaryRamp(theme), [theme.palette.primary.main, theme.palette.mode]);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const textColor = theme.palette.text.secondary;
    const gridColor = theme.palette.divider;
    const { lo, hi } = ramp;
    const { labels, rowLabels, data, min, max, cols, nRows } = matrix;

    const chart = new Chart(canvasRef.current.getContext('2d'), {
      type: 'matrix',
      data: {
        datasets: [
          {
            data,
            backgroundColor: (ctx) => {
              const v = ctx.raw?.v;
              if (!v) return 'transparent';
              // Map the non-zero range [min, max] onto the ramp; the legend uses
              // the same endpoints, so cells and legend stay consistent.
              const norm = max > min ? (v - min) / (max - min) : 1;
              return mix(lo, hi, norm);
            },
            // Empty cells are outlined so the grid stays readable. The border is
            // drawn inside the cell, so neighbours share a seam without gaps.
            borderWidth: 1,
            borderColor: (ctx) => (ctx.raw?.v ? 'transparent' : gridColor),
            // Cells tile the plot area exactly — no spacing between them.
            width: ({ chart: c }) => (c.chartArea?.width || 0) / cols,
            height: ({ chart: c }) => (c.chartArea?.height || 0) / nRows,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => `≤ ${items[0]?.raw?.y ?? ''}`,
              label: (ctx) => `${ctx.raw?.x}: ${fmtRate(ctx.raw?.v)}`,
            },
          },
        },
        scales: {
          x: {
            type: 'category',
            labels,
            offset: true,
            grid: { display: false },
            ticks: { color: textColor, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 },
          },
          y: {
            type: 'category',
            labels: rowLabels,
            offset: true,
            grid: { display: false },
            ticks: { color: textColor, autoSkip: false },
          },
        },
      },
    });
    chartRef.current = chart;
    return () => {
      chart.destroy();
      chartRef.current = null;
    };
  }, [bucketsSig, matrix, ramp, theme.palette.mode]);

  const height = Math.max(220, buckets.length * 28 + 48);

  return (
    <>
      <Box sx={{ position: 'relative', height, width: '100%' }}>
        <canvas ref={canvasRef} />
        {!matrix.hasData && <CollectingOverlay />}
      </Box>

      {/* Color-scale legend: gradient from the low to the high cell color, with
          the value range labeled at each end. */}
      {matrix.hasData && (
        <Box sx={{ mt: 1.5, width: 220 }}>
          <Box
            sx={{
              height: 10,
              borderRadius: 1,
              background: `linear-gradient(to right, ${rgbStr(ramp.lo)}, ${rgbStr(ramp.hi)})`,
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.25 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {fmtRate(matrix.min)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {fmtRate(matrix.max)}
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
};

LatencyHeatmap.propTypes = {
  // Ascending `le` buckets: { label, keys[] } where keys are the series sharing
  // that bucket boundary (summed across endpoints/methods/statuses).
  buckets: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      keys: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
  history: PropTypes.array.isRequired,
};

export default LatencyHeatmap;
