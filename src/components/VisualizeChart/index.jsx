// import Chart from 'chart.js/auto';
// import chroma from 'chroma-js';
// import get from 'lodash/get';
// import { useSnackbar } from 'notistack';
// import PropTypes from 'prop-types';
// import React, { useEffect, useState } from 'react';
// import ViewPointModal from './ViewPointModal';
// import { imageTooltip } from './ImageTooltip';
// import { bigIntJSON } from '../../common/bigIntJSON';

// const SCORE_GRADIENT_COLORS = ['#EB5353', '#F9D923', '#36AE7C'];

// const VisualizeChart = ({ scrollResult }) => {
//   const { enqueueSnackbar } = useSnackbar();
//   const [openViewPoints, setOpenViewPoints] = useState(false);
//   const [viewPoints, setViewPoint] = useState([]);

//   useEffect(() => {
//     if (!scrollResult.data && !scrollResult.error) {
//       return;
//     }

//     if (scrollResult.error) {
//       enqueueSnackbar(`Visualization Unsuccessful, error: ${bigIntJSON.stringify(scrollResult.error)}`, {
//         variant: 'error',
//       });

//       return;
//     } else if (!scrollResult.data?.result?.points.length) {
//       enqueueSnackbar(`Visualization Unsuccessful, error: No data returned`, {
//         variant: 'error',
//       });
//       return;
//     }

//     const dataset = [];
//     const colorBy = scrollResult.data.color_by;

//     let labelby = null;
//     if (colorBy?.payload) {
//       labelby = colorBy.payload;
//       // Color and label by payload field
//       if (get(scrollResult.data.result?.points[0]?.payload, labelby) === undefined) {
//         enqueueSnackbar(`Visualization Unsuccessful, error: Color by field ${labelby} does not exist`, {
//           variant: 'error',
//         });
//         return;
//       }
//       scrollResult.data.labelByArrayUnique = [
//         ...new Set(scrollResult.data.result?.points?.map((point) => get(point.payload, labelby))),
//       ];
//       scrollResult.data.labelByArrayUnique.forEach((label) => {
//         dataset.push({
//           label: label,
//           data: [],
//         });
//       });
//     } else if (colorBy?.discover_score) {
//       // Color by discover score
//       const scores = scrollResult.data.result?.points.map((point) => point.score);
//       const minScore = Math.min(...scores);
//       const maxScore = Math.max(...scores);

//       const colorScale = chroma.scale(SCORE_GRADIENT_COLORS);
//       const scoreColors = scores.map((score) => {
//         const normalizedScore = (score - minScore) / (maxScore - minScore);
//         return colorScale(normalizedScore).hex();
//       });

//       const pointRadii = scrollResult.data.result?.points.map((point) => {
//         if (point.from_query) {
//           return 4;
//         } else {
//           return 3;
//         }
//       });

//       dataset.push({
//         label: 'Discover scores',
//         pointBackgroundColor: scoreColors,
//         pointBorderColor: scoreColors,
//         pointRadius: pointRadii,
//         data: [],
//       });
//     } else {
//       // No special coloring
//       dataset.push({
//         label: 'Data',
//         data: [],
//       });
//     }
//     const ctx = document.getElementById('myChart');
//     const myChart = new Chart(ctx, {
//       type: 'scatter',
//       data: {
//         datasets: dataset,
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         scales: {
//           x: {
//             grid: {
//               display: false,
//             },
//             display: false,
//           },
//           y: {
//             display: false,
//           },
//         },
//         plugins: {
//           tooltip: {
//             // only use custom tooltip if color by is not discover score
//             enabled: !colorBy?.discover_score,
//             external: (colorBy?.discover_score && imageTooltip) || undefined,
//             usePointStyle: true,
//             callbacks: {
//               label: (context) => {
//                 const payload = bigIntJSON
//                   .stringify(context.dataset.data[context.dataIndex].point.payload, null, 1)
//                   .split('\n');

//                 if (colorBy?.discover_score) {
//                   const id = context.dataset.data[context.dataIndex].point.id;
//                   const score = context.dataset.data[context.dataIndex].point.score;

//                   return [`id: ${id}`, `score: ${score}`];
//                 } else {
//                   return payload;
//                 }
//               },
//             },
//           },
//           legend: {
//             display: !!labelby,
//           },
//         },
//       },
//       plugins: [
//         {
//           id: 'myEventCatcher',
//           beforeEvent(chart, args) {
//             const event = args.event;
//             if (event.type === 'click') {
//               if (chart.tooltip._active.length > 0) {
//                 const activePoints = chart.tooltip._active.map((point) => {
//                   return {
//                     id: point.element.$context.raw.point.id,
//                     payload: point.element.$context.raw.point.payload,
//                     vector: point.element.$context.raw.point.vector,
//                   };
//                 });
//                 setViewPoint(activePoints);
//                 setOpenViewPoints(true);
//               }
//             }
//           },
//         },
//       ],
//     });

//     const worker = new Worker(new URL('./worker.js', import.meta.url), {
//       type: 'module',
//     });

//     worker.onmessage = (m) => {
//       if (m.data.error) {
//         enqueueSnackbar(`Visualization Unsuccessful, error: ${m.data.error}`, {
//           variant: 'error',
//         });
//       } else if (m.data.result && m.data.result.length > 0) {
//         m.data.result.forEach((dataset, index) => {
//           myChart.data.datasets[index].data = dataset.data;
//         });
//         myChart.update();
//       } else {
//         enqueueSnackbar(`Visualization Unsuccessful, error: Unexpected Error Occured`, { variant: 'error' });
//       }
//     };

//     if (scrollResult.data.result?.points?.length > 0) {
//       worker.postMessage(scrollResult.data);
//     }

//     return () => {
//       myChart.destroy();
//       worker.terminate();
//     };
//   }, [scrollResult]);

//   return (
//     <>
//       <canvas id="myChart"></canvas>
//       <ViewPointModal openViewPoints={openViewPoints} setOpenViewPoints={setOpenViewPoints} viewPoints={viewPoints} />
//     </>
//   );
// };

// VisualizeChart.propTypes = {
//   scrollResult: PropTypes.object.isRequired,
// };

// export default VisualizeChart;

import { Button } from '@mui/material';
import Chart from 'chart.js/auto';
import get from 'lodash/get';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import ViewPointModal from './ViewPointModal';
import { imageTooltip } from './ImageTooltip';
import { bigIntJSON } from '../../common/bigIntJSON';

const labelIdxDict = {};
export let myChart = null;

function prepareDataset(data) {
  const dataset = [];
  const labelBy = data.color_by?.payload;
  const points = data.result?.points;

  if (labelBy) {
    data.labelByArrayUnique.forEach(label => {
      dataset.push({
        label: label,
        data: [],
      });
    });
    points?.forEach((point) => {
      const label = get(point.payload, labelBy);
      const labelIdx = get(labelIdxDict, label, data.labelByArrayUnique.indexOf(label));
      dataset[labelIdx].data.push({
        x: 0,
        y: 0,
        point,
      });
      labelIdxDict[label] = labelIdx;
    });
  }
  else {
    dataset.push({
      label: 'data',
      data: [],
    });
    points?.forEach((point) => {
      dataset[0].data.push({
        x: 0,
        y: 0,
        point,
      });
    });
  }

  return dataset;
}

function mutateDataset(actualDataset, resultDataset, reducedPoint, cols) {
  const labelBy = actualDataset.color_by?.payload;
  const points = actualDataset.result?.points;

  if (labelBy) {
    const labelDataDict = {};
    points?.forEach((point, idx) => {
      const label = get(point.payload, labelBy);
      const labelDataIdx = get(labelDataDict, label, 0);

      resultDataset[labelIdxDict[label]]
        .data[labelDataIdx].x = reducedPoint[idx * cols];
      resultDataset[labelIdxDict[label]]
        .data[labelDataIdx].y = reducedPoint[idx * cols + 1];

      labelDataDict[label] = labelDataIdx + 1;
    });
  }
  else {
    for (let i = 0; i < reducedPoint.length / cols; ++i) {
      resultDataset[0].data[i].x = reducedPoint[i * cols];
      resultDataset[0].data[i].y = reducedPoint[i * cols + 1];
    }
  }
}

const VisualizeChart = ({ distanceMatrixResult }) => {
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
    if (!distanceMatrixResult.data && !distanceMatrixResult.error) {
      return;
    }

    if (distanceMatrixResult.error) {
      enqueueSnackbar(`Visualization Unsuccessful\nError: ${bigIntJSON.stringify(distanceMatrixResult.error)}`, {
        variant: 'error',
        style: { whiteSpace: 'pre-line' },
        action,
      });
      return;
    }
    else if (distanceMatrixResult.data?.result?.points.length === 0) {
      enqueueSnackbar(`Visualization Unsuccessful\nError: No data returned`, {
        variant: 'error',
        style: { whiteSpace: 'pre-line' },
        action,
      });
      return;
    }
    else if (distanceMatrixResult.data?.result?.ids.length === 1) {
      enqueueSnackbar(`Visualization Unsuccessful\nError: Cannot perform t-SNE on single point`, {
        variant: 'error',
        style: { whiteSpace: 'pre-line' },
        action,
      });
      return;
    }

    const dataset = [];
    const colorBy = distanceMatrixResult.data.color_by;
    const channel = new MessageChannel();

    let labelby = null;
    if (colorBy?.payload) {
      labelby = colorBy.payload;
      // Color and label by payload field
      if (get(distanceMatrixResult.data.result?.points[0]?.payload, labelby) === undefined) {
        enqueueSnackbar(`Visualization Unsuccessful\nError: Color by field ${labelby} does not exist`, {
          variant: 'error',
          style: { whiteSpace: 'pre-line' },
          action,
        });
        return;
      }
      distanceMatrixResult.data.labelByArrayUnique = [
        ...new Set(distanceMatrixResult.data.result?.points?.map((point) => get(point.payload, labelby))),
      ];
      distanceMatrixResult.data.labelByArrayUnique.forEach((label) => {
        dataset.push({
          label: label,
          data: [],
        });
      });
    } else {
      // No special coloring
      dataset.push({
        label: 'Data',
        data: [],
      });
    }
    const ctx = document.getElementById('myChart');
    myChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: dataset,
      },
      options: {
        animation: false,
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
            enabled: !colorBy?.discover_score,
            external: (colorBy?.discover_score && imageTooltip) || undefined,
            usePointStyle: true,
            callbacks: {
              label: (context) => {
                const payload = bigIntJSON
                  .stringify(context.dataset.data[context.dataIndex].point.payload, null, 1)
                  .split('\n');

                if (colorBy?.discover_score) {
                  const id = context.dataset.data[context.dataIndex].point.id;
                  const score = context.dataset.data[context.dataIndex].point.score;

                  return [`id: ${id}`, `score: ${score}`];
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
        {
          id: 'AfterUpdate',
          afterRender: () => {
            channel.port1.postMessage(false);
          }
        }
      ],
    });

    // const worker = new Worker(new URL('./worker.js', import.meta.url), {
    //     type: 'module',
    // });

    const worker = new Worker(new URL('./tsneWorker.js', import.meta.url), {
      type: 'module',
    });

    let sharedArray;
    let typedArray;
    let resultDataset;
    const outputDim = 2;

    worker.onmessage = (m) => {
      if (m.data.error) {
        enqueueSnackbar(`Visualization Unsuccessful\nError: ${m.data.error}`, {
          variant: 'error',
          style: { whiteSpace: 'pre-line' },
          action,
        });
        console.error(m.data.error);
      }
      else if (m.data.error === null) {
        mutateDataset(distanceMatrixResult.data, resultDataset, typedArray, outputDim);
        resultDataset.forEach((dataset, index) => {
          myChart.data.datasets[index].data = dataset.data;
        });
        myChart.update();
      }
      else {
        enqueueSnackbar(`Visualization Unsuccessful\nError: Unexpected Error Occured`, {
          variant: 'error',
          style: { whiteSpace: 'pre-line' },
          action
        });
      }
    };

    // Error handling for worker
    worker.onerror = e => {
      console.error(e);
      myChart.destroy();
    }

    if (distanceMatrixResult.data.result?.points?.length > 0) {
      sharedArray = new SharedArrayBuffer(
        Float64Array.BYTES_PER_ELEMENT * distanceMatrixResult.data.result.points.length * outputDim
      );
      typedArray = new Float64Array(sharedArray);
      resultDataset = prepareDataset(distanceMatrixResult.data);
      worker.postMessage({ command: "CONN" }, [channel.port2]);
      worker.postMessage({
        command: "FWD",
        details: {
          distances: distanceMatrixResult.data.result.scores,
          indices: distanceMatrixResult.data.result.offsets_col,
          nsamples: distanceMatrixResult.data.result.ids.length,
          distanceType: distanceMatrixResult.data.distance_type,
        },
        sharedArray,
        time: Date.now()
      });
    }

    return () => {
      myChart.destroy();
      worker.terminate();
      channel.port1.close();
      channel.port2.close();
    };
  }, [distanceMatrixResult]);

  return (
    <>
      <canvas id="myChart"></canvas>
      <ViewPointModal
        openViewPoints={openViewPoints}
        setOpenViewPoints={setOpenViewPoints}
        viewPoints={viewPoints}
      />
    </>
  );
};

VisualizeChart.propTypes = {
  distanceMatrixResult: PropTypes.object.isRequired,
};

export default VisualizeChart;
