import React, { useMemo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardHeader, CardContent, useTheme } from '@mui/material';
import Chart from 'chart.js/auto';
import { preprocess } from './preprocess';
import { createChartConfig, calculateBackgroundColors } from './helpers';
import TimelineNavigator from '../TimelineNavigator/TimelineNavigator';
import { parseTime } from '../Tree/helpers';
import { calculateTimeRange } from '../TimelineNavigator/helpers';

const Timeline = ({ data, requestTime, onSelect, selectedItem, ...other }) => {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [range, setRange] = useState(null);

  const timelineData = useMemo(() => {
    return preprocess(data, requestTime);
  }, [data, requestTime]);

  // Set initial range to the full available time range
  useEffect(() => {
    if (!timelineData || timelineData.length === 0) return;

    const { minTime, maxTime } = calculateTimeRange(timelineData);
    setRange([minTime, maxTime]);
  }, [timelineData]);

  // Filter data based on selected range
  const filteredData = useMemo(() => {
    if (!range || !timelineData) return timelineData;
    const [start, end] = range;
    return timelineData.filter((item) => {
      const itemStart = parseTime(item.started_at);
      const itemEnd = parseTime(item.finished_at);
      // Include if overlaps with range
      return itemEnd >= start && itemStart <= end;
    });
  }, [timelineData, range]);

  // Use a ref for onSelect so we don't need to rebuild the chart just for callback changes
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const chartBaseConfig = useMemo(() => {
    return createChartConfig(filteredData, theme, onSelectRef, range);
  }, [filteredData, theme, range]);

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
        chartInstanceRef.current = null;
      }
    };
  }, [chartBaseConfig]);

  // Effect to update highlighting only without full re-render
  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart || !filteredData || !canvasRef.current) return;
    if (!chart.data?.datasets?.[0]) return;

    const backgroundColors = calculateBackgroundColors(filteredData, selectedItem, theme);

    // Update dataset colors
    chart.data.datasets[0].backgroundColor = backgroundColors;
    chart.update('none'); // 'none' mode prevents animation on update
  }, [selectedItem, filteredData, theme]);

  return (
    <Box>
      <Card
        elevation={0}
        sx={{
          overflow: 'unset',
        }}
        {...other}
      >
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
        <TimelineNavigator data={timelineData} range={range} onRangeChange={setRange} />
      </Card>
    </Box>
  );
};

Timeline.propTypes = {
  data: PropTypes.object,
  requestTime: PropTypes.string,
  onSelect: PropTypes.func,
  selectedItem: PropTypes.object,
};

export default Timeline;
