import React from 'react';
import { Grid } from '@mui/material';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import { PAGE_CONTENT_WIDTH } from '../theme/constants';
import MetricsDashboard from '../components/Metrics/MetricsDashboard';

function Metrics() {
  return (
    <CenteredFrame maxWidth="xl">
      <Grid container maxWidth={PAGE_CONTENT_WIDTH.content} width={'100%'}>
        <Grid size={12}>
          <MetricsDashboard />
        </Grid>
      </Grid>
    </CenteredFrame>
  );
}

export default Metrics;
