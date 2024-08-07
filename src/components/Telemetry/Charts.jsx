import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, Collapse, Link, MenuItem, Select, Tooltip, Typography, useTheme } from '@mui/material';
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

const Charts = ({ chartSpecsText, setChartSpecsText }) => {
  const [chartsData, setChartsData] = useState({});
  const [chartLabels, setChartLabels] = useState([]);
  const { client: qdrantClient } = useClient();
  const [chartInstances, setChartInstances] = useState({});
  const [reloadInterval, setReloadInterval] = useState(2);
  const [intervalId, setIntervalId] = useState(null);
  const theme = useTheme();
  const [timeWindow, setTimeWindow] = useState(60000);

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

  const removeChart = (path) => {
    try {
      const requestBody = bigIntJSON.parse(chartSpecsText);
      const newPaths = requestBody.paths.filter((p) => p !== path);
      requestBody.paths = newPaths;
      setChartSpecsText(JSON.stringify(requestBody, null, 2));
    } catch (e) {
      console.error('Failed to remove chart', e);
    }
  };

  const handleTimeWindowChange = (event) => {
    setTimeWindow(event.target.value);
  };

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
      } else if (requestBody.paths && requestBody.reload_interval && typeof requestBody.reload_interval === 'number') {
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
                duration: timeWindow,
              },
            },
          },
        },
      });

      syncColors(newChart);
      setChartInstances((prevInstances) => ({
        ...prevInstances,
        [path]: newChart,
      }));
    };

    chartLabels.forEach(createChart);
  }, [chartLabels, reloadInterval, timeWindow]);

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

  const syncColors = (chart) => {
    const color = theme.palette.mode === 'dark' ? 'white' : 'black';
    const gridColor = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    chart.options.scales.x.grid.color = gridColor;
    chart.options.scales.y.grid.color = gridColor;
    chart.options.plugins.title.color = color;
    chart.options.scales.x.ticks.color = color;
    chart.options.scales.y.ticks.color = color;
    chart.update();
  };

  useEffect(() => {
    Object.keys(chartInstances).forEach((path) => {
      const chart = chartInstances[path];
      syncColors(chart);
    });
  }, [theme.palette.mode]);

  return (
    <>
      {alerts.map((alert, index) => (
        <AlertComponent key={index} alert={alert} index={index} setAlerts={setAlerts} />
      ))}

      {/* Time window selector */}
      <Box sx={{ display: 'flex', justifyContent: 'center', m: 2 }}>
        <Select value={timeWindow} onChange={handleTimeWindowChange} sx={{ minWidth: 120 }}>
          <MenuItem value={60000}>1 Minute</MenuItem>
          <MenuItem value={300000}>5 Minutes</MenuItem>
          <MenuItem value={600000}>10 Minutes</MenuItem>
        </Select>
      </Box>

      {Object.keys(chartsData).map((path) => (
        <Box key={path} sx={{ p: 2, borderRadius: 2, m: 2, border: '1px solid', borderColor: 'grey.300' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6">
              {path.length > 50 ? (
                <Tooltip title={path} arrow>
                  <span>{path.substring(0, 50)}...</span>
                </Tooltip>
              ) : (
                <span>{path}</span>
              )}
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                removeChart(path);
              }}
            >
              Remove
            </Button>
          </Box>
          <Box
            sx={{
              height: 300,
            }}
          >
            <canvas id={path}></canvas>
          </Box>
        </Box>
      ))}
    </>
  );
};

Charts.propTypes = {
  chartSpecsText: PropTypes.string.isRequired,
  setChartSpecsText: PropTypes.func.isRequired,
};

export default Charts;
