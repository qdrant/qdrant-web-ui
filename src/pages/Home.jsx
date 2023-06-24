import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {Box,Toolbar,CssBaseline,Tooltip,Stack} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MuiAppBar from '@mui/material/AppBar';
import { Outlet } from 'react-router-dom';
import { ApiKeyDialog } from "../components/authDialog/authDialog";
import { ColorModeContext } from "../context/color-context";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import KeyIcon from '@mui/icons-material/Key';
import { useClient } from "../context/client-context";
import { Logo } from "../components/Logo";
import Sidebar  from '../components/Sidebar';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  background: theme.palette.background.default,
  zIndex: theme.zIndex.drawer + 1
}));

export default function MiniDrawer() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const [version, setVersion] = useState("???");
  const colorMode = React.useContext(ColorModeContext);

  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const { client: qdrantClient } = useClient();

  async function getQdrantVersion() {
    // console.log("qdrantClient.api", qdrantClient._openApiClient);
    try {
      let telemetry = await qdrantClient.api("service").telemetry();
      setVersion(telemetry.data.result.app.version);
    } catch (error) {
      if (error.status === 403 || error.status === 401) {
        setApiKeyDialogOpen(true);
      } else {
        console.log("error", error);
      }
    }
  }

  React.useEffect(() => {
    getQdrantVersion();
  }, []);

  const OnApyKeyApply = () => {
    // Reload the page to apply the new API Key
    window.location.reload();
  }
  
  const handleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            aria-label="open drawer"
            onClick={handleDrawer}
            edge="start"
            sx={{
              marginRight: 5,
            }}
          >
            <MenuIcon />
          </IconButton>
          <Stack dir="col" sx={{ my: 2, alignItems: 'center' }}>
            <Logo width={200} />
          </Stack>
          <Box sx={{ flexGrow: 1 }}></Box>
          <Tooltip title="Color Mode">
            <IconButton
              size="large"
              onClick={colorMode.toggleColorMode}
            >
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="API Key">
            <IconButton
              size="large"
              onClick={() => setApiKeyDialogOpen(true)}>
              <KeyIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Sidebar open={open} version={version}/>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        <Outlet />
      </Box>
      <ApiKeyDialog open={apiKeyDialogOpen} setOpen={setApiKeyDialogOpen} onApply={OnApyKeyApply} />
    </Box>
  );
}