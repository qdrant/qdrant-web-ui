import React, { useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material';
import Chart from 'chart.js/auto';
import { parseTime } from '../Tree/helpers';
import { calculateActivityDensity } from './helpers';
import {
  NavigatorContainer,
  ChartContainer,
  SliderOverlay,
  RangeSlider,
} from './TimelineNavigatorStyled';

const TimelineNavigator = ({ data, range, onRangeChange }) => {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Calculate min from data, max is current time
  const { minTime, maxTime } = useMemo(() => {
    if (!data || data.length === 0) {
      return { minTime: 0, maxTime: Date.now() };
    }
    const startTimes = data.map((item) => parseTime(item.started_at));
    return {
      minTime: Math.min(...startTimes),
      maxTime: Date.now(),
    };
  }, [data]);

  // Create area chart config showing activity density
  const chartConfig = useMemo(() => {
    if (!data || data.length === 0) return null;

    const densityPoints = calculateActivityDensity(data, minTime, maxTime);

    return {
      data: {
        datasets: [
          {
            data: densityPoints,
            fill: true,
            backgroundColor: theme.palette.primary.main,
            borderColor: theme.palette.primary.dark,
            borderWidth: 1,
            tension: 0.4,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          x: {
            type: 'linear',
            min: minTime,
            max: maxTime,
            display: false,
          },
          y: {
            display: false,
            beginAtZero: true,
          },
        },
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false },
        },
      },
    };
  }, [data, theme, minTime, maxTime]);

  // Initialize chart
  useEffect(() => {
    if (!canvasRef.current || !chartConfig) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: chartConfig.data,
      options: chartConfig.options,
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartConfig]);

  const handleSliderChange = (event, newValue) => {
    onRangeChange?.(newValue);
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <NavigatorContainer>
      <ChartContainer>
        <canvas ref={canvasRef} />
      </ChartContainer>
      <SliderOverlay>
        <RangeSlider
          value={range || [minTime, maxTime]}
          onChange={handleSliderChange}
          min={minTime}
          max={maxTime}
          disableSwap
        />
      </SliderOverlay>
    </NavigatorContainer>
  );
};

TimelineNavigator.propTypes = {
  data: PropTypes.array,
  range: PropTypes.array,
  onRangeChange: PropTypes.func,
};

export default TimelineNavigator;
