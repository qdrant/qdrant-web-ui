import { parseTime } from '../Tree/helpers';

export const createChartConfig = (timelineData = [], theme, onSelectRef, range) => {
  const labels = timelineData.map(() => '');

  // Calculate time range for minimum bar width calculation
  const timeRange = range
    ? range[1] - range[0]
    : timelineData.length > 0
    ? Math.max(...timelineData.map((item) => parseTime(item.finished_at))) -
      Math.min(...timelineData.map((item) => parseTime(item.started_at)))
    : 0;

  // Calculate minimum bar width: at least 0.1% of the time range, or 10ms, whichever is larger
  // This ensures bars are always visible even when extremely short
  const minBarWidth = Math.max(timeRange * 0.001, 10); // 0.1% of range or 10ms minimum

  // Floating bars: [start, end]
  // Extend bars that are shorter than minimum width to ensure visibility
  const floatingBars = timelineData.map((item) => {
    const start = parseTime(item.started_at);
    const end = parseTime(item.finished_at);
    const duration = end - start;

    // If bar is shorter than minimum, extend it while keeping it centered
    if (duration < minBarWidth) {
      const center = (start + end) / 2;
      const newStart = center - minBarWidth / 2;
      const newEnd = center + minBarWidth / 2;
      return [newStart, newEnd];
    }

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
        borderSkipped: false, // Ensure all corners are rounded
        barPercentage: 0.5,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
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
        min: range ? range[0] : undefined,
        max: range ? range[1] : undefined,
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
          callback: function (value) {
            const date = new Date(value);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            const timeString = `${hours}:${minutes}:${seconds}`;

            if (!range) {
              return timeString;
            }

            const [minTime] = range;
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

            // Check if the earliest time of range is less than a day from now
            const isLessThanDay = (now - minTime) < oneDay;

            // Show only time if range is less than a day
            if (isLessThanDay) {
              return timeString;
            }

            // Otherwise show full date and time in ISO format
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day} ${timeString}`;
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
            // Use original data to show actual duration, not extended width
            const index = context.dataIndex;
            const item = timelineData[index];
            if (!item) return '';
            
            const start = new Date(parseTime(item.started_at)).toLocaleTimeString();
            const end = new Date(parseTime(item.finished_at)).toLocaleTimeString();
            const actualDuration = (parseTime(item.finished_at) - parseTime(item.started_at)) / 1000;
            const duration = actualDuration.toFixed(2);
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
};

export const calculateBackgroundColors = (timelineData, selectedItem, theme) => {
  return timelineData.map((item) => {
    const isSelected =
      selectedItem && item.started_at === selectedItem.started_at && item.finished_at === selectedItem.finished_at;
    const isOngoing = item.isOngoing === true;

    if (isSelected) {
      // Selected ongoing optimizations use darker warning color (darker yellow)
      if (isOngoing) {
        return theme.palette.warning.dark;
      }
      // Selected completed optimizations use darker primary color
      return theme.palette.primary.dark;
    }
    
    // Use warning color for ongoing optimizations to make them stand out
    if (isOngoing) {
      return theme.palette.warning.main;
    }
    
    // Completed optimizations use the standard primary color
    return theme.palette.primary.main;
  });
};
