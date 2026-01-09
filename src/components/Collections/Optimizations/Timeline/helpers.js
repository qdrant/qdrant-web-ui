import { parseTime } from '../Tree/helpers';

export const createChartConfig = (timelineData = [], theme, onSelectRef, range) => {
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
};

export const calculateBackgroundColors = (timelineData, selectedItem, theme) => {
  return timelineData.map((item) => {
    const isSelected =
      selectedItem && item.started_at === selectedItem.started_at && item.finished_at === selectedItem.finished_at;

    if (isSelected) {
      return theme.palette.primary.dark;
    }
    return theme.palette.primary.main;
  });
};
