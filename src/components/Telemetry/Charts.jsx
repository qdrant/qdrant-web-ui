import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, Collapse, Grid, Link, Paper, Tooltip, Typography, useTheme } from '@mui/material';
import { bigIntJSON } from '../../common/bigIntJSON';
import { useClient } from '../../context/client-context';
import _ from 'lodash';
import { Chart } from 'chart.js';
import StreamingPlugin from '@robloche/chartjs-plugin-streaming';
import 'chartjs-adapter-luxon';
import ChartControlBar from './ChartControlBar';

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
  const [telemetryData, setTelemetryData] = useState({});
  const { client: qdrantClient } = useClient();
  const [chartInstances, setChartInstances] = useState({});
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
      setChartLabels(newPaths);
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
        const paths = requestBody.refresh ? requestBody.paths : _.union(requestBody.paths, chartLabels);
        const fetchTelemetryData = async () => {
          try {
            const response = await qdrantClient.api('service').telemetry({ details_level: 10 });
            setTelemetryData(response.data.result);
            paths?.forEach((path) => {
              const data = _.get(response.data.result, path, null);
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

        setChartLabels(paths);
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
      setChartLabels([]);
    };
  }, [chartSpecsText]);

  useEffect(() => {
    Object.keys(chartInstances).forEach((chart) => {
      chartInstances[chart].destroy();
    });
    setChartInstances({});
    chartLabels.forEach(createChart);
  }, [chartLabels]);

  useEffect(() => {
    Object.keys(chartInstances).forEach((path) => {
      const chart = chartInstances[path];
      chart.options.scales.x.realtime.duration = timeWindow;
      chart.update();
    });
  }, [timeWindow]);

  useEffect(() => {
    if (Object.keys(telemetryData).length === 0) {
      return;
    }

    Object.keys(chartInstances).forEach((path) => {
      const chart = chartInstances[path];
      const data = _.get(telemetryData, path, null);
      chart.data.datasets.forEach(function (dataset) {
        dataset.data.push({
          x: Date.now(),
          y: data,
        });
      });
      chart.update();
    });
  }, [telemetryData]);

  const createChart = (path) => {
    const context = document.getElementById(path);
    const newChart = new Chart(context, {
      type: 'line',
      data: {
        labels: Object.keys(chartsData[path] || {}),
        datasets: [
          {
            label: path,
            data: Object.keys(chartsData[path] || {}).map((key) => ({
              x: key,
              y: chartsData[path][key],
            })),
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
    newChart.id = path;
    setChartInstances((prevInstances) => ({
      ...prevInstances,
      [path]: newChart,
    }));
  };

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
      <Paper
        variant="heading"
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1,
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6">Telemetry</Typography>
        <ChartControlBar
          setChartSpecsText={setChartSpecsText}
          handleTimeWindowChange={handleTimeWindowChange}
          timeWindow={timeWindow}
          chartSpecsText={chartSpecsText}
        />
      </Paper>
      {alerts.map((alert, index) => (
        <AlertComponent key={index} alert={alert} index={index} setAlerts={setAlerts} />
      ))}
      <Grid container spacing={2} p={2}>
        {chartLabels.map((path) => (
          <Grid item xs={12} md={6} key={path}>
            <Box key={path} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'grey.300' }}>
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
          </Grid>
        ))}
      </Grid>
    </>
  );
};

Charts.propTypes = {
  chartSpecsText: PropTypes.string.isRequired,
  setChartSpecsText: PropTypes.func.isRequired,
};

export default Charts;
