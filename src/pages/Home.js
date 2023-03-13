import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Outlet } from 'react-router-dom';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
// import { useState } from "react";
import Toolbar from '@mui/material/Toolbar';
import { IconButton } from "@mui/material";
import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import MenuIcon from '@mui/icons-material/Menu';
import { Stack } from '@mui/material';
import { Logo } from "../components/Logo";


const drawerWidth = 240;
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  background: 'white',
  boxShadow: 'none',
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    background: 'white',
    boxShadow: 'none',
  }),
}));

export default function Home() {

  const [open, setOpen] = useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <Stack
            dir="col"
            style={{ marginLeft: "20px", marginRight: "50px" }}
            sx={{
              mr: 2,
              ...(open && { display: 'none' })
            }}
          >
            <Logo
              width={200}
              padding={5}
            />
          </Stack>
          <IconButton
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              mr: 2,
              ...(open && { display: 'none' })
            }}
          >
            <MenuIcon style={{ fontSize: "36px" }} />
          </IconButton>
          <div
            style={{
              position: "absolute",
              top: "5px",
              right: "20px"
            }}
          >
            <Navbar />
          </div>
        </Toolbar>

      </AppBar>
      <Sidebar open={open} handleDrawerClose={handleDrawerClose} />
      <Main
        open={open}
        style={{
          overflow: "hidden"

        }}
      >
        <DrawerHeader />
        <Outlet />
      </Main>

    </Box>
  );
}