import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Chart from 'chart.js/auto';
import { formatValue } from '../../lib/metrics-parser';
import { seriesColor } from './colors';

// Horizontal bar chart of a single value per category (e.g. total requests per
// endpoint). Categories can have long names, hence the horizontal layout.
const MetricBarChart = ({ labels, values, unit = 'number' }) => {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const labelsSig = useMemo(() => labels.join('|'), [labels]);

  // (Re)create when the categories or theme change.
  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const gridColor = theme.palette.divider;
    const textColor = theme.palette.text.secondary;
    const chart = new Chart(canvasRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: seriesColor(theme, 0).main,
            borderRadius: 4,
            maxBarThickness: 24,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => formatValue(ctx.parsed.x, unit) } },
        },
        scales: {
          x: {
            grid: { color: gridColor },
            border: { display: false },
            ticks: { color: textColor, maxTicksLimit: 5, callback: (value) => formatValue(value, unit) },
          },
          y: { grid: { display: false }, ticks: { color: textColor, autoSkip: false } },
        },
      },
    });
    chartRef.current = chart;
    return () => {
      chart.destroy();
      chartRef.current = null;
    };
  }, [labelsSig, theme.palette.mode, unit]);

  // Feed new values without rebuilding.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update('none');
  }, [labels, values]);

  const height = Math.max(160, labels.length * 34);
  const hasData = values.some((v) => v != null);

  return (
    <Box sx={{ position: 'relative', height, width: '100%' }}>
      <canvas ref={canvasRef} />
      {!hasData && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Collecting data…
          </Typography>
        </Box>
      )}
    </Box>
  );
};

MetricBarChart.propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  values: PropTypes.arrayOf(PropTypes.number).isRequired,
  unit: PropTypes.string,
};

export default MetricBarChart;
