import Chart from 'chart.js/auto';
import chroma from 'chroma-js';
import get from 'lodash/get';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import ViewPointModal from './ViewPointModal';
import { bigIntJSON } from '../../common/bigIntJSON';

const SCORE_GRADIENT_COLORS = ['#EB5353', '#F9D923', '#36AE7C'];
const BACKGROUND_COLOR = '#9ad0f5';
const BORDER_COLOR = '#41a7ec';
const SELECTED_BORDER_COLOR = '#881177';

const VisualizeChart = ({ scrollResult, algorithm = null, activePoint, setActivePoint }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [openViewPoints, setOpenViewPoints] = useState(false);
  const [viewPoints, setViewPoint] = useState([]);

  let localSelectedPoint = activePoint;

  const handlePointHover = (chart) => {

    if (!chart.tooltip?._active) return;
    if (chart.tooltip?._active.length === 0) return;

    const selectedPoint = chart.tooltip?._active[0].element.$context.raw.point;

    if (selectedPoint.id === activePoint?.id) return;
    if (selectedPoint.id === localSelectedPoint?.id) return;
    localSelectedPoint = selectedPoint;


    const data = chart.data.datasets[0].data;

    chart.options.elements.point.pointBorderColor = Array.from(
      { length: data.length },
      () => BORDER_COLOR
    );
    chart.options.elements.point.pointBorderColor =
      chart.options.elements.point.pointBorderColor.map((color, index) => {
        if (selectedPoint.id === data[index].point.id) {
          return SELECTED_BORDER_COLOR;
        }
        return color;
      });
    chart.options.elements.point.pointBackgroundColor = Array.from(
      { length: chart.data.datasets[0].data.length },
      () => BACKGROUND_COLOR
    );
    chart.options.elements.point.pointBackgroundColor = chart.options.elements.point.pointBackgroundColor.map(
      (color, index) => {
        if (selectedPoint.id === chart.data.datasets[0].data[index].point.id) {
          return SELECTED_BORDER_COLOR;
        }
        return color;
      }
    );

    setActivePoint(selectedPoint);
    chart.update();
  }

  useEffect(() => {
    if (!scrollResult.data && !scrollResult.error) {
      return;
    }

    if (scrollResult.error) {
      enqueueSnackbar(`Visualization Unsuccessful, error: ${bigIntJSON.stringify(scrollResult.error)}`, {
        variant: 'error',
      });

      return;
    } else if (!scrollResult.data?.result?.points.length) {
      enqueueSnackbar(`Visualization Unsuccessful, error: No data returned`, {
        variant: 'error',
      });
      return;
    }

    const dataset = [];
    const colorBy = scrollResult.data.color_by;

    let labelby = null;
    if (colorBy?.payload) {
      labelby = colorBy.payload;
      // Color and label by payload field
      if (get(scrollResult.data.result?.points[0]?.payload, labelby) === undefined) {
        enqueueSnackbar(`Visualization Unsuccessful, error: Color by field ${labelby} does not exist`, {
          variant: 'error',
        });
        return;
      }
      scrollResult.data.labelByArrayUnique = [
        ...new Set(scrollResult.data.result?.points?.map((point) => get(point.payload, labelby))),
      ];
      scrollResult.data.labelByArrayUnique.forEach((label) => {
        dataset.push({
          label: label,
          data: [],
        });
      });
    } else if (colorBy?.discover_score) {
      // Color by discover score
      const scores = scrollResult.data.result?.points.map((point) => point.score);
      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);

      const colorScale = chroma.scale(SCORE_GRADIENT_COLORS);
      const scoreColors = scores.map((score) => {
        const normalizedScore = (score - minScore) / (maxScore - minScore);
        return colorScale(normalizedScore).hex();
      });

      const pointRadii = scrollResult.data.result?.points.map((point) => {
        if (point.from_query) {
          return 4;
        } else {
          return 3;
        }
      });

      dataset.push({
        label: 'Discover scores',
        pointBackgroundColor: scoreColors,
        pointBorderColor: scoreColors,
        pointRadius: pointRadii,
        data: [],
      });
    } else {
      // No special coloring
      dataset.push({
        label: 'Data',
        data: [],
      });
    }
    const ctx = document.getElementById('myChart');
    const myChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: dataset,
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
        plugins: {
          tooltip: {
            // only use custom tooltip if color by is not discover score
            enabled: true,
            usePointStyle: true,
            callbacks: {
              label: (context) => {
                handlePointHover(context.chart);
                const id = context.dataset.data[context.dataIndex].point.id;
                return `Point ${id}`;
              },
            },
          },
          legend: {
            display: !!labelby,
          },
        },
      },
      plugins: [
        {
          id: 'myEventCatcher',
          beforeEvent(chart, args) {
            const event = args.event;
            if (event.type === 'click') {
              if (chart.tooltip._active.length > 0) {
                const activePoints = chart.tooltip._active.map((point) => {
                  return {
                    id: point.element.$context.raw.point.id,
                    payload: point.element.$context.raw.point.payload,
                    vector: point.element.$context.raw.point.vector,
                  };
                });
                setViewPoint(activePoints);
                setOpenViewPoints(true);
              }
            }
          },
        },
      ],
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
        m.data.result.forEach((dataset, index) => {
          myChart.data.datasets[index].data = dataset.data;
        });
        myChart.update();
      } else {
        enqueueSnackbar(`Visualization Unsuccessful, error: Unexpected Error Occured`, { variant: 'error' });
      }
    };

    if (scrollResult.data.result?.points?.length > 0) {
      worker.postMessage({
        ...scrollResult.data,
        algorithm: algorithm,
      });
    }

    return () => {
      myChart.destroy();
      worker.terminate();
    };
  }, [scrollResult]);

  return (
    <>
      <canvas id="myChart"></canvas>
      <ViewPointModal openViewPoints={openViewPoints} setOpenViewPoints={setOpenViewPoints} viewPoints={viewPoints} />
    </>
  );
};

VisualizeChart.propTypes = {
  scrollResult: PropTypes.object.isRequired,
  algorithm: PropTypes.string,
  activePoint: PropTypes.object,
  setActivePoint: PropTypes.func,
};

export default VisualizeChart;
