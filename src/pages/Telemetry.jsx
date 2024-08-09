import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import TelemetryEditorWindow from '../components/Telemetry/Editor';
import Charts from '../components/Telemetry/Charts';

const query = `
// Graph Rendering:
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
// The reload_interval is set to 2 seconds in this example.
// This means that the graphs and data metrics on the page will be updated every 2 seconds,
// providing near real-time monitoring of the system's performance.



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
const defaultResult = ``;
function Telemetry() {
  const [code, setCode] = useState(query);
  const [result, setResult] = useState(defaultResult);
  const theme = useTheme();

  return (
    <>
      <Box component="main">
        <Grid container>
          <Grid
            xs={12}
            item
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 64px)',
            }}
          >
            <PanelGroup direction="horizontal">
              <Panel>
                <Box
                  sx={{
                    height: '100%',
                    overflow: 'auto',
                  }}
                >
                  <Charts chartSpecsText={result} setChartSpecsText={setResult} />
                </Box>
              </Panel>
              <PanelResizeHandle
                style={{
                  width: '10px',
                  background: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  &#8942;
                </Box>
              </PanelResizeHandle>
              <Panel>
                <TelemetryEditorWindow code={code} onChange={setCode} onChangeResult={setResult} />
              </Panel>
            </PanelGroup>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default Telemetry;
