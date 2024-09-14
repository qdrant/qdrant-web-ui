import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Drawer,
  IconButton,
  ListItem,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useClient } from '../../context/client-context';
import { Close } from '@mui/icons-material';
import TelemetryEditorWindow from './Editor';
import { bigIntJSON } from '../../common/bigIntJSON';

const query = `// Graph Rendering:
// Graphs are rendered based on numerical outputs obtained from the specified JSON paths.
// Only metrics that return numeric values are used to create visual representations.
// This ensures that the graphs are meaningful and accurately reflect the system's status.

// JSON Path:
// The JSON paths listed here are extracted from the /telemetry?details_level=10 endpoint.
// They represent specific fields within the JSON response structure returned by the API.
// For example, paths like 'collections.collections[0].shards[0].local.segments[0].info.num_indexed_vectors'
// indicate nested structures where specific values are accessed using indices or keys.
// This path extracts the number of indexed vectors in the first segment of the first shard of the first collection,
// which is crucial for understanding the indexing performance of the collection.

// Reload Interval:
// The reload_interval is set to 2 seconds by default.
// This means that the graphs and data metrics on the page will be updated every 2 seconds,
// providing near real-time monitoring of the system's performance.

//Time Window:
// The time window for the graphs is set to 1 min by default.


{
  "reload_interval": 2,
  "paths": [
    "requests.rest.responses['OPTIONS /telemetry'][200].avg_duration_micros",
    "app.system.disk_size",
    "app.system.ram_size",
    "collections.collections[0].shards[0].local.segments[0].info.num_indexed_vectors",
    "requests.rest.responses['GET /telemetry'][200].count"
  ]
}`;

const ChartControlBar = ({ setChartSpecsText, timeWindow, handleTimeWindowChange, chartSpecsText }) => {
  const matchesMdMedia = useMediaQuery('(max-width: 992px)');
  const [reloadInterval, setReloadInterval] = useState(2);
  const [open, setOpen] = useState(false);
  const [jsonPaths, setJsonPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  const { client: qdrantClient } = useClient();
  const [code, setCode] = useState(query);

  function extractNumericalPaths(obj, currentPath = '') {
    let paths = [];

    if (typeof obj === 'number') {
      paths.push(`requests.${currentPath}`);
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const newPath = currentPath ? `${currentPath}.${key}` : key;
          paths = [...paths, ...extractNumericalPaths(obj[key], newPath)];
        }
      }
    }

    return paths;
  }

  useEffect(() => {
    const fetchTelemetryData = async () => {
      try {
        const response = await qdrantClient.api('service').telemetry({ details_level: 10 });
        setJsonPaths(extractNumericalPaths(response.data.result.requests));
      } catch (error) {
        console.error('Failed to fetch telemetry data', error);
      }
    };
    fetchTelemetryData();
  }, []);

  const generateChartSpecs = (newSelectedPath, newReloadInterval) => {
    const chartSpecs = {
      reload_interval: newReloadInterval,
      paths: newSelectedPath,
      refresh: true,
    };
    if (newReloadInterval !== reloadInterval) {
      setReloadInterval(newReloadInterval);
    }
    if (newSelectedPath !== selectedPath) {
      setSelectedPath(newSelectedPath);
    }

    return JSON.stringify(chartSpecs, null, 2);
  };

  useEffect(() => {
    if (chartSpecsText) {
      try {
        const chartSpecs = bigIntJSON.parse(chartSpecsText);
        if (chartSpecs.reload_interval !== reloadInterval) {
          setReloadInterval(chartSpecs.reload_interval);
        }
        if (chartSpecs.paths !== selectedPath) {
          setSelectedPath(chartSpecs.paths);
        }
      } catch (e) {
        console.error('Failed to parse chartSpecsText', e);
      }
    }
  }, [chartSpecsText]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        alignContent: 'center',
        gap: '1rem',
        width: '100%',
        justifyContent: 'flex-end',
        ml: 2,
      }}
    >
      <Autocomplete
        sx={{
          width: '40%',
        }}
        value={selectedPath}
        limitTags={1}
        multiple
        id="ChartPaths"
        options={jsonPaths}
        disableCloseOnSelect
        renderInput={(params) => (
          <TextField {...params} label="Select JSON Path:" placeholder="Select json path to render charts" />
        )}
        onChange={(event, value) => {
          setChartSpecsText(generateChartSpecs(value, reloadInterval));
        }}
        renderOption={(props, option, { selected }) => (
          <ListItem {...props}>
            <Box
              sx={{
               
                border: '1px solid #e0e0e0',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Checkbox style={{ marginRight: 8 }} checked={selected} />
              <Box>
                <Typography>Request: {option.split('.')[3]}</Typography>
                <Typography>Status Code: {option.split('.')[4]}</Typography>
                <Typography>Metric: {option.split('.')[5]}</Typography>
              </Box>
            </Box>
          </ListItem>
        )}
      />
      <Typography variant="h6">Reload Interval:</Typography>
      <Select
        value={reloadInterval}
        onChange={(e) => setChartSpecsText(generateChartSpecs(selectedPath, e.target.value))}
      >
        <MenuItem value={2}>2 Seconds</MenuItem>
        <MenuItem value={5}>5 Seconds</MenuItem>
        <MenuItem value={10}>10 Seconds</MenuItem>
      </Select>
      <Typography variant="h6">Time Window:</Typography>
      <Select value={timeWindow} onChange={handleTimeWindowChange}>
        <MenuItem value={60000}>1 Minute</MenuItem>
        <MenuItem value={300000}>5 Minutes</MenuItem>
        <MenuItem value={600000}>10 Minutes</MenuItem>
      </Select>
      <Button variant="outlined" size="large" onClick={() => setOpen(true)}>
        Advanced mode
      </Button>
      <Drawer
        anchor={'right'}
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            minWidth: matchesMdMedia ? '100vw' : '680px',
            width: matchesMdMedia ? '100vw' : '55vw',
            padding: '1rem',
            pt: '6rem',
          },
          '& .MuiBackdrop-root.MuiModal-backdrop': {
            opacity: '0 !important',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mr: 2 }}>
          <Typography variant={'h5'}>Add Charts</Typography>

          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={() => setOpen(false)}>
            <Close />
          </IconButton>
        </Box>

        <TelemetryEditorWindow code={code} onChange={setCode} onChangeResult={setChartSpecsText} />
      </Drawer>
    </Box>
  );
};
ChartControlBar.propTypes = {
  timeWindow: PropTypes.number.isRequired,
  handleTimeWindowChange: PropTypes.func.isRequired,
  setChartSpecsText: PropTypes.func.isRequired,
  chartSpecsText: PropTypes.string.isRequired,
};

export default ChartControlBar;
