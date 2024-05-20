import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Box, Toolbar, CssBaseline, Tooltip, AppBar, Badge } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Outlet } from 'react-router-dom';
import { ApiKeyDialog } from '../components/authDialog/authDialog';
import { ColorModeContext } from '../context/color-context';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import KeyIcon from '@mui/icons-material/Key';
import { useClient } from '../context/client-context';
import { Logo } from '../components/Logo';
import Sidebar from '../components/Sidebar/Sidebar';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from 'axios';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

export default function MiniDrawer() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [version, setVersion] = useState('???');
  const [jwtEnabled, setJwtEnabled] = useState(false);
  const colorMode = React.useContext(ColorModeContext);
  const [issusesCount, setIssusesCount] = useState(0);
  const [issuses, setIssuses] = useState([]);

  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const { client: qdrantClient } = useClient();

  async function getQdrantInfo() {
    try {
      const telemetry = await qdrantClient.api('service').telemetry();
      setVersion(telemetry.data.result.app.version);
      setJwtEnabled(telemetry.data.result.app?.jwt_rbac || false);
    } catch (error) {
      if (error.status === 403 || error.status === 401) {
        setApiKeyDialogOpen(true);
      } else {
        console.log('error', error);
      }
    }
  }

  React.useEffect(() => {
    getQdrantInfo();
  }, []);

  const OnApyKeyApply = () => {
    // Reload the page to apply the new API Key
    window.location.reload();
  };

  const handleDrawer = () => {
    setOpen(!open);
  };

  async function getIssuesCount() {
    try {
      const issues = await axios.get('/issues');
      setIssuses(issues.data.result.issues);
      setIssusesCount(issues.data.result.issues.length);
    } catch (error) {
      console.log('error', error);
    }
  }

  React.useEffect(() => {
    const interval = setInterval(() => {
      getIssuesCount();
      console.log('This will run every 5 seconds!', issuses);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: theme.palette.background.default,
          boxShadow: 'none',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <IconButton
            aria-label="open drawer"
            onClick={handleDrawer}
            edge="start"
            sx={{
              marginRight: 2,
            }}
          >
            <MenuIcon />
          </IconButton>
          <Logo width={200} />
          <Box sx={{ flexGrow: 1 }}></Box>
          <Tooltip title="Issuses">
            <IconButton size="large">
              <Badge color="error" badgeContent={issusesCount}>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Color Mode">
            <IconButton size="large" onClick={colorMode.toggleColorMode}>
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="API Key">
            <IconButton size="large" onClick={() => setApiKeyDialogOpen(true)}>
              <KeyIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Sidebar open={open} version={version} jwtEnabled={jwtEnabled} />
      <Box component="main" sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <DrawerHeader />
        <Outlet />
      </Box>
      <ApiKeyDialog open={apiKeyDialogOpen} setOpen={setApiKeyDialogOpen} onApply={OnApyKeyApply} />
    </Box>
  );
}
