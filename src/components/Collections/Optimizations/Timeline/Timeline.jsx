import React, { useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, useTheme } from '@mui/material';
import Chart from 'chart.js/auto';
import { preprocess } from './preprocess';
import { parseTime } from '../Tree/helpers';

const Timeline = ({ data, requestTime, ...other }) => {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const timelineData = useMemo(() => {
    return preprocess(data, requestTime);
  }, [data, requestTime]);

  // Prepare chart data and options
  const chartConfig = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return null;

    const labels = timelineData.map(() => '');
    
    // Floating bars: [start, end]
    // The x-axis will use these values.
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
          backgroundColor: theme.palette.primary.main,
          borderRadius: 4,
          barPercentage: 0.5,
          // In Chart.js 3+, 'indexAxis: y' makes it horizontal bar chart
          // data values for bars should be [min, max] for floating bars
        },
      ],
    };

    const options = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          min: timelineData.length > 0 ? parseTime(timelineData[0].started_at) : undefined,
          grid: {
            color: theme.palette.divider,
          },
          ticks: {
            color: theme.palette.text.secondary,
            callback: function(value) {
                return new Date(value).toLocaleTimeString();
            }
          },
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
             color: theme.palette.text.primary,
          }
        },
      },
      plugins: {
        tooltip: {
            callbacks: {
                label: function(context) {
                    const raw = context.raw; // [start, end]
                    const start = new Date(raw[0]).toLocaleTimeString();
                    const end = new Date(raw[1]).toLocaleTimeString();
                    const duration = ((raw[1] - raw[0]) / 1000).toFixed(2);
                    return `${start} - ${end} (${duration}s)`;
                }
            }
        },
        legend: {
          display: false,
        },
      },
    };

    return { data: chartData, options };
  }, [timelineData, theme]);

  // Effect to manage Chart instance
  useEffect(() => {
    if (!canvasRef.current || !chartConfig) return;

    // Destroy existing chart if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Create new chart
    const ctx = canvasRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar', // 'bar' with indexAxis: 'y' creates horizontal bar
      data: chartConfig.data,
      options: chartConfig.options,
    });

    // Cleanup on unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartConfig]);

  return (
    <Card elevation={0} {...other}>
      <CardHeader
      title={'Timeline'}
       variant="heading"
        slotProps={{
           title: {
            sx: {
                pb: '0.4rem'
            }
           }
        }}
        />
      <CardContent sx={{ pt: 0, height: 400 }}>
        {chartConfig ? (
             <canvas ref={canvasRef} />
        ) : (
            'No data available'
        )}
      </CardContent>
    </Card>
  );
};

Timeline.propTypes = {
  data: PropTypes.object,
  requestTime: PropTypes.string,
};

export default Timeline;
