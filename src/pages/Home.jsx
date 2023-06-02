import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Toolbar from "@mui/material/Toolbar";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import KeyIcon from '@mui/icons-material/Key';
import { ApiKeyDialog } from "../components/authDialog/authDialog";
import { useClient } from "../context/client-context";
import { ColorModeContext } from "../context/color-context";
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import Tooltip from '@mui/material/Tooltip';


const drawerWidth = 240;
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  boxShadow: "none",
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    background: theme.palette.background.default,
    boxShadow: "none",
  }),
}));

export default function Home() {
  const [open, setOpen] = useState(true);
  const [version, setVersion] = useState("???");
  const colorMode = React.useContext(ColorModeContext);
  const theme = useTheme();

  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const { client: qdrantClient } = useClient();

  async function getQdrantVersion() {
    // console.log("qdrantClient.api", qdrantClient._openApiClient);
    try {
      let telemetry = await qdrantClient.api("service").telemetry();
      setVersion(telemetry.data.result.app.version);
    } catch (error) {
      if (error.status === 403) {
        setApiKeyDialogOpen(true);
      } else {
        console.log("error", error);
      }
    }
  }

  React.useEffect(() => {
    getQdrantVersion();
  }, []);

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const OnApyKeyApply = () => {
    // Reload the page to apply the new API Key
    window.location.reload();
  }

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar open={open}>
        <Toolbar>
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
      <Sidebar open={open} version={version} handleDrawerClose={handleDrawerClose} />
      <Main
        open={open}
        style={{
          overflow: "hidden",
        }}
      >
        <DrawerHeader />
        <Outlet />
      </Main>
      <ApiKeyDialog open={apiKeyDialogOpen} setOpen={setApiKeyDialogOpen} onApply={OnApyKeyApply} />
    </Box >
  );
}
