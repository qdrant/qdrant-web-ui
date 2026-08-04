import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import { PAGE_CONTENT_WIDTH } from '../theme/constants';
import QuotasCard from '../components/Settings/QuotasCard';

function Settings() {
  return (
    <CenteredFrame>
      <Grid container maxWidth={PAGE_CONTENT_WIDTH.narrow} width={'100%'} spacing={3}>
        <Grid size={12}>
          <Typography variant="h4" component="h1">
            Settings
          </Typography>
        </Grid>

        <Grid size={12}>
          <Box display="flex" flexDirection="column" gap={5}>
            <QuotasCard />
          </Box>
        </Grid>
      </Grid>
    </CenteredFrame>
  );
}

export default Settings;
