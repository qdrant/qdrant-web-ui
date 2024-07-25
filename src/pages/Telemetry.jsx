import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import { useClient } from '../context/client-context';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import Chart from 'chart.js/auto';
import { useTheme } from '@mui/material/styles';
import { Info } from '@mui/icons-material';

function Telemetry() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('GET /telemetry');
  const [chartData, setChartData] = useState({});
  const [selectedEndpoints, setSelectedEndpoints] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(1);
  const [telemetryData, setTelemetryData] = useState(null);
  const { client: qdrantClient } = useClient();
  const [chartInstances, setChartInstances] = useState({});
  const theme = useTheme();

  useEffect(() => {
    const fetchTelemetryData = async () => {
      try {
        const response = await qdrantClient.api('service').telemetry();
        setTelemetryData(response.data.result.requests.rest.responses);

        const currentTime = new Date().toLocaleTimeString();

        selectedEndpoints.forEach((endpoint) => {
          setChartData((prevData) => ({
            ...prevData,
            [endpoint]: {
              ...prevData[endpoint],
              [currentTime]: response.data.result.requests.rest.responses[endpoint][200],
            },
          }));
        });
      } catch (error) {
        console.error('Failed to fetch telemetry data', error);
      }
    };

    fetchTelemetryData();

    const intervalId = setInterval(() => {
      fetchTelemetryData();
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [refreshInterval, selectedEndpoints]);

  const updateRefreshInterval = (interval) => {
    setRefreshInterval(interval);
    setChartData(
      Object.keys(chartData).reduce((acc, endpoint) => {
        acc[endpoint] = {};
        return acc;
      }, {})
    );
  };

  const addChart = (endpoint) => {
    Object.keys(chartInstances).forEach((chart) => {
      chartInstances[chart].destroy();
    });
    setChartInstances({});

    setSelectedEndpoints((prevEndpoints) => [...prevEndpoints, endpoint]);
    setChartData((prevData) => ({
      ...prevData,
      [endpoint]: {},
    }));
  };

  useEffect(() => {
    selectedEndpoints.forEach((endpoint) => {
      const context = document.getElementById(endpoint);

      const chart = new Chart(context, {
        type: 'line',
        data: {
          labels: Object.keys(chartData[endpoint]),
          datasets: [
            {
              label: 'Avg query latency(ms)',
              data: Object.values(chartData[endpoint])?.map((value) => value?.avg_duration_micros) || [],
              yAxisID: 'y',
            },
            {
              label: 'Query count',
              data: Object.values(chartData[endpoint])?.map((value) => value?.count) || [],
              yAxisID: 'y1',
            },
          ],
        },
        options: {
          responsive: true,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          stacked: false,
          plugins: {
            title: {
              display: true,
              text: endpoint,
            },
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: {
                drawOnChartArea: false,
              },
            },
          },
        },
      });

      setChartInstances((prevInstances) => ({
        ...prevInstances,
        [endpoint]: chart,
      }));
    });
  }, [selectedEndpoints]);

  useEffect(() => {
    syncColors();
    Object.keys(chartInstances).forEach((endpoint) => {
      const chart = chartInstances[endpoint];
      chart.data.datasets[0].data = Object.values(chartData[endpoint]).map((value) => value?.avg_duration_micros) || [];
      chart.data.datasets[1].data = Object.values(chartData[endpoint]).map((value) => value?.count) || [];
      chart.data.labels = Object.keys(chartData[endpoint]);
      chart.update();
    });
  }, [chartData]);

  const syncColors = () => {
    Object.keys(chartInstances).forEach((endpoint) => {
      const chart = chartInstances[endpoint];
      const color = theme.palette.mode === 'dark' ? 'white' : 'black';
      const gridColor = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

      chart.options.scales.x.grid.color = gridColor;
      chart.options.scales.y.grid.color = gridColor;
      chart.options.scales.y1.grid.color = gridColor;
      chart.options.plugins.title.color = color;
      chart.options.scales.x.ticks.color = color;
      chart.options.scales.y.ticks.color = color;
      chart.options.scales.y1.ticks.color = color;

      chart.update();
    });
  };

  useEffect(() => {
    syncColors();
  }, [theme.palette.mode]);

  return (
    <CenteredFrame>
      <Grid container maxWidth="xl" spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">Telemetry</Typography>
        </Grid>
        <Grid item xs={12}>
          <Card
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
            }}
            variant="outlined"
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexGrow: 1,
              }}
            >
              <FormControl fullWidth sx={{ maxWidth: 400 }}>
                <Select value={selectedEndpoint} onChange={(e) => setSelectedEndpoint(e.target.value)}>
                  {telemetryData
                    ? Object.keys(telemetryData)
                        .sort()
                        .map((endpoint) => (
                          <MenuItem key={endpoint} value={endpoint}>
                            {endpoint}
                          </MenuItem>
                        ))
                    : null}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                color="success"
                size="large"
                onClick={() => addChart(selectedEndpoint)}
                disabled={selectedEndpoints.includes(selectedEndpoint)}
              >
                Add Graph
              </Button>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <FormControl fullWidth sx={{ maxWidth: 200 }}>
                <InputLabel id="refresh-interval-label">Refresh Interval</InputLabel>
                <Select
                  labelId="refresh-interval-label"
                  label="Refresh Interval"
                  value={refreshInterval}
                  onChange={(e) => updateRefreshInterval(e.target.value)}
                >
                  <MenuItem value={1}>1 second</MenuItem>
                  <MenuItem value={5}>5 seconds</MenuItem>
                  <MenuItem value={15}>15 seconds</MenuItem>
                  <MenuItem value={30}>30 seconds</MenuItem>
                  <MenuItem value={60}>1 minute</MenuItem>
                </Select>
              </FormControl>

              <Tooltip
                title="Looking for a full-scale monitoring solution? Our cloud 
              platform offers advanced features and detailed insights. Click here to explore more."
              >
                <IconButton size="large" onClick={() => window.open('https://cloud.qdrant.io/')}>
                  <Info />
                </IconButton>
              </Tooltip>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12}>
          {selectedEndpoints.map((endpoint) => (
            <Box
              key={endpoint}
              sx={{
                border: '1px solid',
                borderColor: 'grey.300',
                p: 2,
                borderRadius: 2,
                mb: 2,
              }}
            >
              <canvas id={endpoint} height="70vh"></canvas>
            </Box>
          ))}
        </Grid>
      </Grid>
    </CenteredFrame>
  );
}

export default Telemetry;
