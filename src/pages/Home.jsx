import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Box, Toolbar, CssBaseline, Tooltip, AppBar, IconButton } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { ApiKeyDialog } from '../components/authDialog/authDialog';
import { Key } from 'lucide-react';
import ColorModeToggle from '../components/Common/ColorModeToggle';
import { useClient } from '../context/client-context';
import { Logo } from '../components/Logo';
import Sidebar from '../components/Sidebar/Sidebar';

import { MaxCollectionsProvider, useMaxCollections } from '../context/max-collections-context';

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
  const [version, setVersion] = useState('???');
  const [jwtEnabled, setJwtEnabled] = useState(false);
  const [jwtVisible, setJwtVisible] = useState(true);
  const { setMaxCollections } = useMaxCollections();

  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const { client: qdrantClient } = useClient();

  async function getQdrantInfo() {
    try {
      const telemetry = await qdrantClient.api('service').telemetry();
      setVersion(telemetry.data.result.app.version);
      setJwtEnabled(telemetry.data.result.app?.jwt_rbac || false);
      setMaxCollections(telemetry.data.result.collections?.max_collections);

      if (telemetry.data.result.app?.hide_jwt_dashboard) {
        setJwtVisible(false);
      }
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
          <Box sx={{ flexGrow: 1 }}></Box>
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
      <Sidebar version={version} jwtEnabled={jwtEnabled} jwtVisible={jwtVisible} />
      <Box component="main" sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <DrawerHeader />
        <Outlet context={{ version }} />
      </Box>
      <ApiKeyDialog open={apiKeyDialogOpen} setOpen={setApiKeyDialogOpen} onApply={OnApyKeyApply} />
    </Box>
  );
}

export default function MiniDrawer() {
  return (
    <MaxCollectionsProvider>
      <HomeContent />
    </MaxCollectionsProvider>
  );
}
