import React from 'react';
import { Alert, Box, Grid, Typography } from '@mui/material';
import { useClient } from '../context/client-context';
import InfoCard from '../components/Common/InfoCard/InfoCard';
import TutorialLinks from '../components/InteractiveTutorial/TutorialLinks';
import ExternalTutorialLinks from '../components/IntegratedTutorials/ExternalTutorialLinks';
import { Zap, FileCode } from 'lucide-react';

export const TutorialIndex = () => {
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
    <Box
      component="main"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        p: 5,
        margin: 'auto',
        maxWidth: '1120px',
      }}
    >
      <Box component="header">
        <Typography
          component="h1"
          variant="h4"
          sx={{
            color: 'text.primary',
            fontSize: '2rem',
            fontStyle: 'normal',
            fontWeight: '600',
            lineHeight: '125%',
            letterSpacing: '-0.5px',
            mb: '1rem',
          }}
        >
          Welcome to Qdrant!
        </Typography>
      </Box>

      <Box component="section">
        <Typography component="h2" variant="h6" mb="1rem">
          Connect to your Project or Start with Samples
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard
              icon={Zap}
              title="Quickstart"
              description={'Create a collection, upsert vectors, and run a search.'}
              href="/tutorial/quickstart"
              showCta={false}
              sx={{ flexGrow: 1 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard
              icon={FileCode}
              title="Load Sample Data"
              description={`Follow this tutorial to import a remote snapshot and explore vector search with real data in just a few steps.`}
              href="/tutorial/loadcontent"
              showCta={false}
              sx={{ flexGrow: 1 }}
            />
          </Grid>
        </Grid>
      </Box>

      <ExternalTutorialLinks />
      <TutorialLinks sections={['filtering', 'vectorSearch', 'multitenancy']} />
    </Box>
  );
};

export default TutorialIndex;
