import React, { useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, useTheme } from '@mui/material';
import Chart from 'chart.js/auto';
import { preprocess } from './preprocess';
import { parseTime } from '../Tree/helpers';

const Timeline = ({ data, requestTime, onSelect, selectedItem, ...other }) => {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const timelineData = useMemo(() => {
    return preprocess(data, requestTime);
  }, [data, requestTime]);

  // Use a ref for onSelect so we don't need to rebuild the chart just for callback changes
  // though chart.js onClick option usually requires a stable reference or update
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Prepare base chart config (data structure, labels, x-axis ranges)
  // This depends only on the data, not selection
  const chartBaseConfig = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return null;

    const labels = timelineData.map(() => '');

    // Floating bars: [start, end]
    const floatingBars = timelineData.map((item) => {
      const start = parseTime(item.started_at);
      const end = parseTime(item.finished_at);
      return [start, end];
    });

    const chartData = {
      labels,
      datasets: [
        {
          label: 'Optimizations',
          data: floatingBars,
          backgroundColor: [], // will be filled/updated later
          borderRadius: 4,
          barPercentage: 0.5,
        },
      ],
    };

    const options = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      onClick: (event, elements) => {
        if (!elements || elements.length === 0) {
          onSelectRef.current && onSelectRef.current(null);
          return;
        }
        const index = elements[0].index;
        const selected = timelineData[index];
        onSelectRef.current && onSelectRef.current(selected);
      },
      onHover: (event, chartElement) => {
        event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default';
      },
      scales: {
        x: {
          min: timelineData.length > 0 ? parseTime(timelineData[0].started_at) : undefined,
          grid: {
            color: theme.palette.divider,
          },
          ticks: {
            color: theme.palette.text.secondary,
            callback: function (value) {
              return new Date(value).toLocaleTimeString();
            },
          },
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            color: theme.palette.text.primary,
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const raw = context.raw; // [start, end]
              const start = new Date(raw[0]).toLocaleTimeString();
              const end = new Date(raw[1]).toLocaleTimeString();
              const duration = ((raw[1] - raw[0]) / 1000).toFixed(2);
              return `${start} - ${end} (${duration}s)`;
            },
          },
        },
        legend: {
          display: false,
        },
      },
    };

    return { data: chartData, options };
  }, [timelineData, theme]); // removed selectedItem dependency

  // Effect to initialize Chart instance
  useEffect(() => {
    if (!canvasRef.current || !chartBaseConfig) return;

    // Destroy existing chart if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Create new chart
    const ctx = canvasRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: chartBaseConfig.data,
      options: chartBaseConfig.options,
    });

    // Cleanup on unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartBaseConfig]);

  // Effect to update highlighting only without full re-render
  useEffect(() => {
    if (!chartInstanceRef.current || !timelineData) return;

    const backgroundColors = timelineData.map((item) => {
      const isSelected =
        selectedItem && item.started_at === selectedItem.started_at && item.finished_at === selectedItem.finished_at;

      if (isSelected) {
        return theme.palette.primary.dark;
      }
      return theme.palette.primary.main;
    });

    // Update dataset colors
    chartInstanceRef.current.data.datasets[0].backgroundColor = backgroundColors;
    chartInstanceRef.current.update('none'); // 'none' mode prevents animation on update
  }, [selectedItem, timelineData, theme]);

  return (
    <Card elevation={0} {...other}>
      <CardHeader
        title={'Timeline'}
        variant="heading"
        slotProps={{
          title: {
            sx: {
              pb: '0.4rem',
            },
          },
        }}
      />
      <CardContent sx={{ pt: 0, height: 400 }}>
        {chartBaseConfig ? <canvas ref={canvasRef} /> : 'No data available'}
      </CardContent>
    </Card>
  );
};

Timeline.propTypes = {
  data: PropTypes.object,
  requestTime: PropTypes.string,
  onSelect: PropTypes.func,
  selectedItem: PropTypes.object,
};

export default Timeline;
