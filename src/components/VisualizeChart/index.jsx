import { Button } from '@mui/material';
import Chart from 'chart.js/auto';
import get from 'lodash/get';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import ViewPointModal from './ViewPointModal';
import chroma from 'chroma-js';

const VisualizeChart = ({ scrollResult }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [openViewPoints, setOpenViewPoints] = useState(false);
  const [viewPoints, setViewPoint] = useState([]);
  const action = (snackbarId) => (
    <Button
      variant="outlined"
      color="inherit"
      onClick={() => {
        closeSnackbar(snackbarId);
      }}
    >
      Dismiss
    </Button>
  );

  useEffect(() => {
    if (!scrollResult.data && !scrollResult.error) {
      return;
    }

    if (scrollResult.error) {
      enqueueSnackbar(`Visualization Unsuccessful, error: ${JSON.stringify(scrollResult.error)}`, {
        variant: 'error',
        action,
      });

      return;
    } else if (!scrollResult.data?.result?.points.length) {
      enqueueSnackbar(`Visualization Unsuccessful, error: No data returned`, {
        variant: 'error',
        action,
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
          action,
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
      
      const colorScale = chroma.scale(['#EB5353', '#F9D923', '#36AE7C']);
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
            callbacks: {
              label: function (context) {
                const payload = JSON.stringify(
                  context.dataset.data[context.dataIndex].point.payload, null, 1
                ).split('\n');

                if (colorBy?.discover_score) {
                  const id = context.dataset.data[context.dataIndex].point.id;
                  const score = context.dataset.data[context.dataIndex].point.score;

                  return [`id: ${id}`, `score: ${score}`, `payload:`, ...payload];
                } else {
                  return payload;
                }
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
          action,
        });
      } else if (m.data.result && m.data.result.length > 0) {
        m.data.result.forEach((dataset, index) => {
          myChart.data.datasets[index].data = dataset.data;
        });
        myChart.update();
      } else {
        enqueueSnackbar(`Visualization Unsuccessful, error: Unexpected Error Occured`, { variant: 'error', action });
      }
    };

    if (scrollResult.data.result?.points?.length > 0) {
      worker.postMessage(scrollResult.data);
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
};

export default VisualizeChart;
