/* eslint-disable */
import React from 'react';
import { alpha, Box } from '@mui/material';
import ErrorNotifier from '../components/ToastNotifications/ErrorNotifier';
import { useClient } from '../context/client-context';
import { useTheme } from '@mui/material/styles';
import JwtForm from '../components/JwtSection/JwtForm';
import JwtResultForm from '../components/JwtSection/JwtResultForm';

function Jwt() {
  const theme = useTheme();
  const { client: qdrantClient } = useClient();

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box
        sx={{
          px: 2,
          pt: 4,
          pb: 20,
          width: '50%',
          overflowY: 'scroll',
          maxWidth: '1200px',
          mx: 'auto',
        }}
      >
        <JwtForm />
      </Box>
      <Box
        sx={{
          overflowY: 'scroll',
          width: '50%',
        }}
      >
        {/*maybe it will be another component*/}
        <JwtResultForm />
      </Box>
    </Box>
  );
}

// todo: remove eslint-disable

export default Jwt;
