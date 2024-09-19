import Chart from 'chart.js/auto';
import get from 'lodash/get';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { generateColorBy, generateSizeBy } from './renderBy';
import { useTheme } from '@mui/material/styles';

// Dark red
const LIGHT_SELECTOR_COLOR = 'rgba(255, 0, 0, 0.5)';
// White
const DARK_SELECTOR_COLOR = 'rgba(245, 245, 245, 0.8)';

// Transparent color for points
const DEFAULT_BORDER_COLOR = 'rgba(0, 0, 0, 0)';

function intoDatasets(
  points, // array of original points, which contain payloads
  data, // list of compressed coordinates
  colors, // list of colors for each point to be displayed
  sizes, // list of sizes for each point to be displayed
  groupBy = null // payload field to group by
) {
  const defaultConfig = {
    pointHitRadius: 1,
    hoverRadius: 7,
  };

  if (!groupBy) {
    // No grouping
    return [
      {
        label: 'Data',
        data,
        offsets: Array.from({ length: data.length }, (_, i) => i),
        pointBackgroundColor: [...colors],
        // Use transparent border color for points
        pointBorderColor: Array.from({ length: colors.length }, () => DEFAULT_BORDER_COLOR),
        ...defaultConfig,
      },
    ];
  }

  const groups = {};

  points.forEach((point, index) => {
    let group = get(point.payload, groupBy) + ''; // Convert to string, even if it's an o

    if (!group) {
      // If specified field is not present in the payload, fallback to 'Unknown'
      group = 'Unknown';
    }

    if (!groups[group]) {
      groups[group] = {
        label: group,
        data: [],
        offsets: [],
        pointBackgroundColor: [],
        pointBorderColor: [],
        pointRadius: [],
        ...defaultConfig,
      };
    }

    groups[group].data.push(data[index]);
    groups[group].offsets.push(index);
    groups[group].pointBackgroundColor.push(colors[index]);
    groups[group].pointBorderColor.push(DEFAULT_BORDER_COLOR);
    groups[group].pointRadius.push(sizes[index]);
  });

  // Convert groups object to array, and sort by label
  return Object.values(groups).sort((a, b) => a.label.localeCompare(b.label));
}

const VisualizeChart = ({
  requestResult, // Raw output of the request from qdrant client
  visualizationParams, // Parameters, as specified by the user in the input editor
  activePoint, // currently selected point (with hover)
  setActivePoint, // callback to set new active point
}) => {
  const { enqueueSnackbar } = useSnackbar();

  // Id of the currently selected point
  // Used to prevent multiple updates of the chart on hover
  // And for switching colors of the selected point
  let selectedPointLocation = null;

  const theme = useTheme();

  function getSelectionColor() {
    return theme.palette.mode === 'light' ? LIGHT_SELECTOR_COLOR : DARK_SELECTOR_COLOR;
  }

  useEffect(() => {
    if (!requestResult.points) {
      return;
    }

    const points = requestResult.points;
    const colorBy = visualizationParams?.color_by;

    // Initialize data with random points in range [0, 1]
    const data = points.map(() => ({
      x: Math.random(),
      y: Math.random(),
    }));

    // This reference values should be used to rollback the color of the previously selected point
    const pointColors = generateColorBy(points, colorBy);
    const sizes = generateSizeBy(points);

    const payloadField = typeof colorBy === 'string' ? colorBy : colorBy?.payload;
    const useLegend = !!payloadField;

    const datasets = intoDatasets(points, data, pointColors, sizes, payloadField);

    const handlePointHover = (chart) => {
      if (!chart.tooltip?._active) return;
      if (chart.tooltip?._active.length === 0) return;

      const lastActive = chart.tooltip._active.length - 1;

      const selectedElement = chart.tooltip._active[lastActive];

      const datasetIndex = selectedElement.datasetIndex;
      const pointIndex = selectedElement.index;

      const offsets = chart.data.datasets[datasetIndex].offsets;
      const pointOffset = offsets[pointIndex];
      const selectedPoint = points[pointOffset];

      // Check if the same point is already selected
      // To prevent recurrant updates of the chart
      if (selectedPoint.id === activePoint?.id) {
        selectedPointLocation = {
          offset: pointOffset,
          datasetIndex,
          pointIndex,
        };
        return selectedPoint;
      }
      if (pointOffset === selectedPointLocation?.offset) {
        return selectedPoint;
      }

      const oldPointLocation = selectedPointLocation;

      selectedPointLocation = {
        offset: pointOffset,
        datasetIndex,
        pointIndex,
      };

      // Reset color of the previously selected point
      if (oldPointLocation) {
        const targetColor = pointColors[oldPointLocation.offset];
        chart.data.datasets[oldPointLocation.datasetIndex].pointBackgroundColor[oldPointLocation.pointIndex] =
          targetColor;

        chart.data.datasets[oldPointLocation.datasetIndex].pointBorderColor[oldPointLocation.pointIndex] =
          DEFAULT_BORDER_COLOR;
      }

      chart.data.datasets[datasetIndex].pointBackgroundColor[pointIndex] = getSelectionColor();
      chart.data.datasets[datasetIndex].pointBorderColor[pointIndex] = getSelectionColor();

      setActivePoint(selectedPoint);

      chart.update();
      return selectedPoint;
    };

    const ctx = document.getElementById('myChart');
    const myChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false,
            },
            display: false,
          },
          y: {
            display: false,
          },
        },
        interaction: {
          mode: 'nearest', // Show tooltip for the nearest point
          intersect: false, // Show even if not directly hovering over a point
        },
        plugins: {
          tooltip: {
            // only use custom tooltip if color by is not discover score
            enabled: true,
            usePointStyle: true,
            position: 'nearest',
            intersect: true,
            callbacks: {
              label: (context) => {
                const selectedPoint = handlePointHover(context.chart);
                if (!selectedPoint) return '';
                const id = selectedPoint.id;
                return `Point ${id}`;
              },
            },
          },
          legend: {
            display: useLegend,
          },
        },
      },
    });

    const worker = new Worker(new URL('./worker.js', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (m) => {
      if (m.data.error) {
        enqueueSnackbar(`Visualization Unsuccessful, error: ${m.data.error}`, {
          variant: 'error',
        });
      } else if (m.data.result && m.data.result.length > 0) {
        const reducedPonts = m.data.result;

        const datasets = intoDatasets(points, reducedPonts, pointColors, sizes, payloadField);

        datasets.forEach((dataset, index) => {
          myChart.data.datasets[index].data = dataset.data;
        });

        myChart.update();
      } else {
        enqueueSnackbar(`Visualization Unsuccessful, error: Unexpected Error Occured`, { variant: 'error' });
      }
    };

    if (requestResult.points?.length > 0) {
      worker.postMessage({
        result: requestResult,
        params: visualizationParams,
      });
    }

    return () => {
      myChart.destroy();
      worker.terminate();
    };
  }, [requestResult]);

  return (
    <>
      <canvas id="myChart"></canvas>
    </>
  );
};

VisualizeChart.propTypes = {
  requestResult: PropTypes.object.isRequired,
  visualizationParams: PropTypes.object.isRequired,
  activePoint: PropTypes.object,
  setActivePoint: PropTypes.func,
};

export default VisualizeChart;
