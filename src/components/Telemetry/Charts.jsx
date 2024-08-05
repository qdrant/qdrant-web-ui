import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Collapse, Link } from '@mui/material';
import { bigIntJSON } from '../../common/bigIntJSON';
import { useClient } from '../../context/client-context';
import _ from 'lodash';
import { Chart } from 'chart.js';
import StreamingPlugin from '@robloche/chartjs-plugin-streaming';
import 'chartjs-adapter-luxon';

Chart.register(StreamingPlugin);

const AlertComponent = ({ alert, index, setAlerts }) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (alert.autoClose) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [alert.autoClose]);

  return (
    <Collapse
      key={index}
      in={open}
      onAnimationEnd={() => {
        if (!open) {
          setAlerts((prevAlerts) => prevAlerts.filter((_, i) => i !== index));
        }
      }}
    >
      <Alert
        onClose={() => {
          setOpen(false);
        }}
        severity={alert.severity}
      >
        {alert.message}
      </Alert>
    </Collapse>
  );
};

AlertComponent.propTypes = {
  alert: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  setAlerts: PropTypes.func.isRequired,
};

const Charts = ({ chartSpecsText }) => {
  const [chartsData, setChartsData] = useState({});
  const [chartLabels, setChartLabels] = useState([]);
  const { client: qdrantClient } = useClient();
  const [chartInstances, setChartInstances] = useState({});
  const [reloadInterval, setReloadInterval] = useState(2);
  const [intervalId, setIntervalId] = useState(null);
  const [alerts, setAlerts] = useState([
    {
      severity: 'info',
      message: (
        <>
          Looking for a full-scale monitoring solution? Our cloud platform offers advanced features and detailed
          insights.{'  '}
          <Link href="https://cloud.qdrant.io/" target="_blank" rel="noreferrer" color="inherit" underline="always">
            Click here to explore more.
          </Link>
        </>
      ),
      autoClose: false,
    },
  ]);

  useEffect(() => {
    const initializeCharts = async () => {
      if (!chartSpecsText) {
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          {
            severity: 'info',
            message: 'No chart specs provided. Please provide a valid JSON to render charts.',
            autoClose: true,
          },
        ]);
        return;
      }

      let requestBody;

      try {
        requestBody = bigIntJSON.parse(chartSpecsText);
      } catch (e) {
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          {
            severity: 'error',
            message: 'Invalid JSON provided. Please provide a valid JSON to render charts.',
            autoClose: true,
          },
        ]);
        console.error('Invalid JSON:', e);
        return;
      }
      if (!requestBody.paths) {
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          {
            severity: 'error',
            message: 'Invalid request body. Please provide a valid JSON to render charts.',
            autoClose: true,
          },
        ]);
        console.error('Invalid request body:', requestBody);
        return;
      } else if (!Array.isArray(requestBody.paths)) {
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          {
            severity: 'error',
            message: 'Invalid paths provided. Please provide an array of paths to render charts.',
            autoClose: true,
          },
        ]);
        console.error('Invalid paths:', requestBody.paths);
        return;
      } else if (requestBody.paths.length === 0) {
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          {
            severity: 'error',
            message: 'No paths provided. Please provide at least one path to render charts.',
            autoClose: true,
          },
        ]);
        console.error('No paths provided:', requestBody.paths);
        return;
      } else if (requestBody.reload_interval && typeof requestBody.reload_interval !== 'number') {
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          {
            severity: 'error',
            message: 'Invalid reload interval provided. Please provide a valid number to reload charts.',
            autoClose: true,
          },
        ]);
        console.error('Invalid reload interval:', requestBody.reload_interval);
        return;
      } else if (
        requestBody.paths &&
        requestBody.paths.length > 0 &&
        requestBody.reload_interval &&
        typeof requestBody.reload_interval === 'number'
      ) {
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

        setChartLabels(requestBody.paths);
        setReloadInterval(requestBody.reload_interval);

        if (requestBody.reload_interval) {
          if (intervalId) {
            clearInterval(intervalId);
          }
          const newIntervalId = setInterval(fetchTelemetryData, requestBody.reload_interval * 1000);
          setIntervalId(newIntervalId);
        }
      } else {
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          {
            severity: 'error',
            message: 'Invalid request body. Please provide a valid JSON to render charts.',
            autoClose: true,
          },
        ]);
        console.error('Invalid request body:', requestBody);
        return;
      }
    };

    initializeCharts();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      setChartsData({});
      setChartLabels([]);
    };
  }, [chartSpecsText]);

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
          labels: Object.keys(chartsData[path]) ?? [],
          datasets: [
            {
              label: path,
              data: Object.values(chartsData[path]) ?? [],
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
          scales: {
            x: {
              type: 'realtime',
              realtime: {
                duration: reloadInterval * 5000,
              },
            },
          },
        },
      });
      setChartInstances((prevInstances) => ({
        ...prevInstances,
        [path]: newChart,
      }));
    };

    chartLabels.forEach(createChart);
  }, [chartLabels, reloadInterval]);

  useEffect(() => {
    if (Object.keys(chartsData).length === 0) {
      return;
    }
    Object.keys(chartInstances).forEach((path) => {
      const chart = chartInstances[path];
      chart.data.labels = Object.keys(chartsData[path]) ?? [];
      chart.data.datasets[0].data = Object.values(chartsData[path]) ?? [];
      chart.update('quiet');
    });
  }, [chartsData]);

  return (
    <>
      {alerts.map((alert, index) => (
        <AlertComponent key={index} alert={alert} index={index} setAlerts={setAlerts} />
      ))}
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
