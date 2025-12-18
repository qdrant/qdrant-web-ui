import React, { useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, useTheme } from '@mui/material';
import Chart from 'chart.js/auto';
import { preprocess } from './preprocess';
import { createChartConfig, calculateBackgroundColors } from './helpers';

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
    return createChartConfig(timelineData, theme, onSelectRef);
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

    const backgroundColors = calculateBackgroundColors(timelineData, selectedItem, theme);

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
