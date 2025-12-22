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
