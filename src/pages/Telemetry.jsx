import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import TelemetryEditorWindow from '../components/Telemetry/Editor';
import Charts from '../components/Telemetry/Charts';

const query = `

// app.system.ram_size
// app.system.disk_size
// collections.number_of_collections
// collections.collections[0].init_time_ms
// collections.collections[0].config.params.vectors.size
// collections.collections[0].config.params.shard_number
// collections.collections[0].config.params.replication_factor
// collections.collections[0].config.params.write_consistency_factor
// collections.collections[0].config.hnsw_config.m
// collections.collections[0].config.hnsw_config.ef_construct
// collections.collections[0].config.hnsw_config.full_scan_threshold
// collections.collections[0].config.hnsw_config.max_indexing_threads
// collections.collections[0].config.optimizer_config.deleted_threshold
// collections.collections[0].config.optimizer_config.vacuum_min_vector_number
// collections.collections[0].config.optimizer_config.default_segment_number
// collections.collections[0].config.optimizer_config.indexing_threshold
// collections.collections[0].config.optimizer_config.flush_interval_sec
// collections.collections[0].config.optimizer_config.max_optimization_threads
// collections.collections[0].config.wal_config.wal_capacity_mb
// collections.collections[0].config.wal_config.wal_segments_ahead



{
  "reload_interval": 2,
  "paths": [
    "app.system.disk_size",
    "app.system.ram_size",
    "collections.collections[0].shards[0].local.segments[0].info.num_indexed_vectors",
    "requests.rest.responses['GET /telemetry'][200].count",
    "requests.rest.responses['OPTIONS /collections'][200].count"
  ]
}`;
const defaultResult = `{
  "reload_interval": 2,
  "paths": [
    "app.system.disk_size",
    "app.system.ram_size",
    "collections.collections[0].shards[0].local.segments[0].info.num_indexed_vectors",
    "requests.rest.responses['GET /telemetry'][200].count",
    "requests.rest.responses['OPTIONS /collections'][200].count"
  ]
}`;
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
                  <Charts chartSpecsText={result} />
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
