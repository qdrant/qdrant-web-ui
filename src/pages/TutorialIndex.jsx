import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Grid, Typography } from '@mui/material';
import { useClient } from '../context/client-context';
import InfoCard from '../components/Common/InfoCard/InfoCard';
import TutorialLinks from '../components/InteractiveTutorial/TutorialLinks';
import { Zap, FileCode } from 'lucide-react';

export const TutorialIndex = () => {
  const { t } = useTranslation();
  const { isRestricted } = useClient();

  if (isRestricted) {
    return (
      <Box sx={{ p: 5, width: '100%' }}>
        <Grid size={12}>
          <Alert severity="warning">
            {t('tutorial.accessDenied')}
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
          {t('welcome.title')}
        </Typography>
      </Box>

      <Box component="section">
        <Typography component="h2" variant="h6" mb="1rem">
          {t('welcome.sectionTitle')}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard
              icon={Zap}
              title={t('tutorial.quickstart')}
              description={t('tutorial.quickstartDescription')}
              href="/tutorial/quickstart"
              showCta={false}
              sx={{ flexGrow: 1 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoCard
              icon={FileCode}
              title={t('welcome.loadSampleData')}
              description={t('welcome.loadSampleDescription')}
              href="/tutorial/loadcontent"
              showCta={false}
              sx={{ flexGrow: 1 }}
            />
          </Grid>
        </Grid>
      </Box>

      <TutorialLinks sections={['filtering', 'vectorSearch', 'multitenancy']} />
    </Box>
  );
};

export default TutorialIndex;
