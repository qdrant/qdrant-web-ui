import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Box, Toolbar, CssBaseline, Tooltip, AppBar, IconButton, Typography } from '@mui/material';
import { Link, Outlet } from 'react-router-dom';
import { ApiKeyDialog } from '../components/authDialog/authDialog';
import { Key } from 'lucide-react';
import ColorModeToggle from '../components/Common/ColorModeToggle';
import { Logo } from '../components/Logo';
import Sidebar from '../components/Sidebar/Sidebar';

import { TelemetryProvider, useVersion, useJwt, useAuthError } from '../context/telemetry-context';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

// todo:
// - [ ] use the path to cloud info json from env (adding falback)
// - [ ] move fetch of cloud info json to a context
// - [ ] move banner file fetch to a context
// - [ ] tests?

function HomeContent() {
  const theme = useTheme();
  const { version } = useVersion();
  const { jwtEnabled, jwtVisible } = useJwt();
  const { authError, clearAuthError } = useAuthError();

  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [cloudInfo, setCloudInfo] = useState(null);

  useEffect(() => {
    if (authError) {
      setApiKeyDialogOpen(true);
    }
  }, [authError]);

  const handleDialogClose = (open) => {
    setApiKeyDialogOpen(open);
    if (!open) {
      clearAuthError();
    }
  };

  useEffect(() => {
    fetch('/cloud/cloudInfo.json')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load cloud info: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setCloudInfo(data))
      .catch(error => console.error('Error fetching cloud info from file:', error));
  }, []);

  const OnApyKeyApply = () => {
    // Reload the page to apply the new API Key
    window.location.reload();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer,
          background: theme.palette.background.paper,
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <Logo width={200} />
          {cloudInfo?.cluster_name ? (
            <Box sx={{ flexGrow: 1, pl: '140px', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
                cluster
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
                /
              </Typography>
              <Typography 
              component={Link}
              to={cloudInfo.cloud_backlink}
              variant="body1"
              sx={{ 
                color: theme.palette.text.primary,
                fontWeight: 500,
                textDecoration: 'none',
                '&:hover': { 
                  textDecoration: 'underline',
                  textDecorationThickness: '1px',
                  textUnderlineOffset: '2px',
                 },
                }}>
                {cloudInfo.cluster_name}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ flexGrow: 1 }}></Box>
          )}
          {/* <Button
            component={Link}
            to="https://qdrant.tech/cloud/" // todo: replace with the actual link
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            color="primary"
            size="small"
            endIcon={<Rocket size={16} />}
            sx={{ mr: 2 }}
          >
            Get Managed Cloud
          </Button> */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="API Key">
              <IconButton size="large" onClick={() => setApiKeyDialogOpen(true)}>
                <Key size={20} />
              </IconButton>
            </Tooltip>
            <ColorModeToggle />
          </Box>
        </Toolbar>
      </AppBar>
      <Sidebar version={version} jwtEnabled={jwtEnabled} jwtVisible={jwtVisible} cloudInfo={cloudInfo} />
      <Box component="main" sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <DrawerHeader />
        <Outlet />
      </Box>
      <ApiKeyDialog open={apiKeyDialogOpen} setOpen={handleDialogClose} onApply={OnApyKeyApply} />
    </Box>
  );
}

export default function MiniDrawer() {
  return (
    <TelemetryProvider>
      <HomeContent />
    </TelemetryProvider>
  );
}
