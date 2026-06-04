import React from 'react';
import InteractiveTutorial from '../components/InteractiveTutorial/InteractiveTutorial';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import { useParams } from 'react-router-dom';
import { Alert, Box, Grid } from '@mui/material';
import { useClient } from '../context/client-context';
import { useTranslation } from 'react-i18next';

export const Tutorial = () => {
  const { pageSlug } = useParams();
  const { isRestricted } = useClient();
  const { t } = useTranslation();

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
    <CenteredFrame>
      <InteractiveTutorial pageSlug={pageSlug} />
    </CenteredFrame>
  );
};

export default Tutorial;
