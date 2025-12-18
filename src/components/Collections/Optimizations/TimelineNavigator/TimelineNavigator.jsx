import React, { useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Slider, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import Chart from 'chart.js/auto';
import { parseTime } from '../Tree/helpers';

const NAVIGATOR_HEIGHT = 60;

const NavigatorContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: NAVIGATOR_HEIGHT,
  marginTop: theme.spacing(2),
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  // todo: fix this (now used for overlay but cuts the slider thumb)
  overflow: 'hidden',
}));

const ChartContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});

// todo: fix this
const SliderOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  padding: '0',
});

const RangeSlider = styled(Slider)(({ theme }) => ({
  '& .MuiSlider-thumb': {
    width: 8,
    height: NAVIGATOR_HEIGHT - 24,
    borderRadius: 4,
    backgroundColor: theme.palette.primary.dark,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='24' fill='${encodeURIComponent(
      theme.palette.text.primary
    )}' viewBox='0 0 24 24'%3E%3Cpath d='M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z' /%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    '&:hover, &.Mui-focusVisible': {
      boxShadow: 'none',
    },
  },
  '& .MuiSlider-track': {
    height: NAVIGATOR_HEIGHT,
    borderRadius: 6,
    background: 'transparent',
    border: `4px solid ${theme.palette.background.paper}`,
    boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5)`,
  },
  '& .MuiSlider-rail': {
    opacity: 0,
  },
}));

/**
 * Calculate activity density: how many tasks are running at each point in time
 * @param {Array} data - Timeline data items
 * @param {number} minTime - Start time in ms
 * @param {number} maxTime - End time in ms
 * @param {number} numPoints - Number of sample points
 * @return {Array} Array of {x, y} points for the chart
 */
const calculateActivityDensity = (data, minTime, maxTime, numPoints = 100) => {
  const step = (maxTime - minTime) / numPoints;
  const points = [];

  for (let i = 0; i <= numPoints; i++) {
    const time = minTime + i * step;
    let count = 0;
    for (const item of data) {
      const start = parseTime(item.started_at);
      const end = parseTime(item.finished_at);
      if (time >= start && time <= end) {
        count++;
      }
    }
    points.push({ x: time, y: count });
  }

  return points;
};

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
