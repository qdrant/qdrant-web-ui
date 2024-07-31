import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { bigIntJSON } from '../../common/bigIntJSON';
import { useClient } from '../../context/client-context';
import _ from 'lodash';
import { Chart } from 'chart.js';

const Charts = ({ chartSpecsText }) => {
  const [chartsData, setChartsData] = useState({});
  const [chartLabels, setChartLabels] = useState([]);
  const { client: qdrantClient } = useClient();
  const [chartInstances, setChartInstances] = useState({});

  useEffect(() => {
    let intervalId;

    const initializeCharts = async () => {
      if (!chartSpecsText) {
        return;
      }

      let requestBody;

      try {
        requestBody = bigIntJSON.parse(chartSpecsText);
      } catch (e) {
        console.error('Invalid JSON:', e);
        return;
      }

      if (requestBody.paths) {
        const fetchTelemetryData = async () => {
          try {
            const response = await qdrantClient.api('service').telemetry({ details_level: 10 });
            requestBody.paths?.forEach((path) => {
              const data = _.get(response.data.result, path, 0);

              setChartsData((prevData) => ({
                ...prevData,
                [path]: {
                  ...prevData[path],
                  [new Date().toLocaleTimeString()]: data,
                },
              }));
            });
          } catch (error) {
            console.error('Failed to fetch telemetry data', error);
          }
        };

        await fetchTelemetryData();

        if (!requestBody.paths) {
          console.error('Invalid request body:', requestBody);
          return;
        } else {
          setChartLabels(requestBody.paths);
        }
        if (requestBody.reload_interval) {
          intervalId = setInterval(fetchTelemetryData, requestBody.reload_interval * 1000);
        }
      }
    };
    initializeCharts();

    return () => {
      clearInterval(intervalId);
      setChartsData({});
      setChartLabels([]);
    };
  }, [chartSpecsText, qdrantClient]);

  useEffect(() => {
    Object.keys(chartInstances).forEach((chart) => {
      chartInstances[chart].destroy();
    });
    setChartInstances({});

    const createChart = (path) => {
      const context = document.getElementById(path);
      const newChart = new Chart(context, {
        type: 'line',
        data: {
          labels: Object.keys(chartsData[path]),
          datasets: [
            {
              label: path,
              data: Object.values(chartsData[path]),
            },
          ],
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
        },
      });
      setChartInstances((prevInstances) => ({
        ...prevInstances,
        [path]: newChart,
      }));
    };

    chartLabels.forEach(createChart);
  }, [chartLabels]);

  useEffect(() => {
    if (Object.keys(chartsData).length === 0) {
      return;
    }
    Object.keys(chartInstances).forEach((path) => {
      const chart = chartInstances[path];
      chart.data.labels = Object.keys(chartsData[path]) ?? [];
      chart.data.datasets[0].data = Object.values(chartsData[path]) ?? [];
      chart.update();
    });
  }, [chartsData]);

  return (
    <>
      {Object.keys(chartsData).map((path) => (
        <Box
          key={path}
          sx={{
            border: '1px solid',
            borderColor: 'grey.300',
            height: 300,
            p: 2,
            borderRadius: 2,
            m: 2,
          }}
        >
          <canvas id={path}></canvas>
        </Box>
      ))}
    </>
  );
};

Charts.propTypes = {
  chartSpecsText: PropTypes.string.isRequired,
};

export default Charts;
