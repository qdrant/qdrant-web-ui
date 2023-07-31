import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js/auto';
import { useSnackbar } from 'notistack';
import { Button } from '@mui/material';
import ViewPointModal from './ViewPointModal';

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
    const labelby = scrollResult.data.color_by;
    if (labelby) {
      if (scrollResult.data.result?.points[0]?.payload[labelby] === undefined) {
        enqueueSnackbar(`Visualization Unsuccessful, error: Color by field ${labelby} does not exist`, {
          variant: 'error',
          action,
        });
        return;
      }
      scrollResult.data.labelByArrayUnique = [
        ...new Set(scrollResult.data.result?.points?.map((point) => point.payload[labelby])),
      ];
      scrollResult.data.labelByArrayUnique.forEach((label) => {
        dataset.push({
          label: label,
          data: [],
        });
      });
    } else {
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
                return JSON.stringify(context.dataset.data[context.dataIndex].point.payload, null, 2).split('\n');
              },
            },
          },
          legend: {
            display: labelby ? true : false,
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
        return;
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
