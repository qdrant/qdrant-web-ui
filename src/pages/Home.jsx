import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Toolbar,
  CssBaseline,
  Tooltip,
  AppBar,
  IconButton,
  Typography,
  Button,
  useMediaQuery,
} from '@mui/material';
import { Link, Outlet } from 'react-router';
import { ApiKeyDialog } from '../components/authDialog/authDialog';
import { Key, Menu, Rocket } from 'lucide-react';
import ColorModeToggle from '../components/Common/ColorModeToggle';
import AccessibilityToggle from '../components/Common/AccessibilityToggle';
import { Logo } from '../components/Logo';
import Sidebar from '../components/Sidebar/Sidebar';

import { TelemetryProvider, useAuthError } from '../context/telemetry-context';
import { CloudInfoProvider, useCloudInfo } from '../context/cloud-info-context';
import { ExternalInfoProvider } from '../context/external-info-context';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

function HomeContent() {
  const theme = useTheme();
  const { authError, clearAuthError } = useAuthError();
  const { cloudInfo } = useCloudInfo();

  const [isInIframe, setIsInIframe] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  // On phones the sidebar is hidden and opened from the menu button in the header.
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
  }, []);

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

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {!isInIframe ? (
        <>
          <AppBar
            position="fixed"
            sx={{
              zIndex: (theme) => theme.zIndex.drawer,
              background: theme.palette.background.paper,
              boxShadow: 'none',
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Toolbar sx={{ [theme.breakpoints.down('sm')]: { px: 1 } }}>
              {isPhone && (
                <IconButton
                  edge="start"
                  aria-label="Open menu"
                  onClick={() => setMobileMenuOpen(true)}
                  sx={{ mr: 0.5 }}
                >
                  <Menu size={20} />
                </IconButton>
              )}
              <Logo width={200} />
              {cloudInfo?.cluster_name ? (
                <Box
                  sx={{
                    flexGrow: 1,
                    minWidth: 0,
                    pl: { xs: 1, sm: '140px' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ color: theme.palette.text.primary, display: { xs: 'none', sm: 'block' } }}
                  >
                    cluster
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: theme.palette.text.primary, display: { xs: 'none', sm: 'block' } }}
                  >
                    /
                  </Typography>
                  <Typography
                    component={Link}
                    to={cloudInfo.cloud_backlink}
                    variant="body1"
                    noWrap
                    sx={{
                      display: 'block',
                      minWidth: 0,
                      color: theme.palette.text.primary,
                      fontWeight: 500,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                        textDecorationThickness: '1px',
                        textUnderlineOffset: '2px',
                      },
                    }}
                  >
                    {cloudInfo.cluster_name}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ flexGrow: 1 }}></Box>
              )}

              {cloudInfo?.scale_url && (
                <Button
                  component={Link}
                  to={cloudInfo.scale_url}
                  target="_blank"
                  variant="contained"
                  color="primary"
                  size="small"
                  endIcon={<Rocket size={16} />}
                  sx={{ mr: 2 }}
                >
                  Upgrade Cluster
                </Button>
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
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                  gap: { xs: 0.5, sm: 2 },
                  [theme.breakpoints.down('sm')]: {
                    '& .MuiIconButton-root': { p: 1 },
                    '& .MuiToggleButton-root': { minWidth: 36, px: 1 },
                  },
                }}
              >
                <Tooltip title="API Key">
                  <IconButton size="large" onClick={() => setApiKeyDialogOpen(true)}>
                    <Key size={20} />
                  </IconButton>
                </Tooltip>
                <AccessibilityToggle />
                <ColorModeToggle />
              </Box>
            </Toolbar>
          </AppBar>
          <Sidebar
            variant={isPhone ? 'temporary' : 'permanent'}
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />
        </>
      ) : (
        <></>
      )}
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, overflowX: 'clip' }}>
        {!isInIframe ? <DrawerHeader /> : <></>}
        <Outlet />
      </Box>
      <ApiKeyDialog open={apiKeyDialogOpen} setOpen={handleDialogClose} required={Boolean(authError)} />
    </Box>
  );
}

export default function MiniDrawer() {
  return (
    <TelemetryProvider>
      <CloudInfoProvider>
        <ExternalInfoProvider>
          <HomeContent />
        </ExternalInfoProvider>
      </CloudInfoProvider>
    </TelemetryProvider>
  );
}
