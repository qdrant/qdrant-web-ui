import React from 'react';
import InteractiveTutorial from '../components/InteractiveTutorial/InteractiveTutorial';
import { TutorialProvider } from '../context/tutorial-context';
import { useParams } from 'react-router-dom';
import { Alert, Box, Grid } from '@mui/material';
import { useClient } from '../context/client-context';

export const Tutorial = () => {
  const { pageSlug } = useParams();
  const { isRestricted } = useClient();

  if (isRestricted) {
    return (
      <Box sx={{ p: 5, width: '100%' }}>
        <Grid size={12}>
          <Alert severity="warning">
            Access Denied: Because of the serverless mode, tutorial will not work here properly. Please contact your
            administrator.
          </Alert>
        </Grid>
      </Box>
    );
  }
  return (
    <TutorialProvider>
      <InteractiveTutorial pageSlug={pageSlug} />
    </TutorialProvider>
  );
};

export default Tutorial;
