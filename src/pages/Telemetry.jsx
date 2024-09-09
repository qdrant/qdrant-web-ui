import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import Charts from '../components/Telemetry/Charts';


const defaultResult = ``;
function Telemetry() {
  const [result, setResult] = useState(defaultResult);
  return (
    <>
      <Box component="main">
        <Grid container>
          <Grid
            xs={12}
            item
            sx={{
              overflow: 'auto',
              height: 'calc(100vh - 64px)',
            }}
          >
            <Charts chartSpecsText={result} setChartSpecsText={setResult} />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default Telemetry;
