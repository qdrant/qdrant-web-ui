import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import { List, Typography, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { LibraryBooks, Terminal, Animation, Key, QueryStats } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import SidebarTutorialSection from './SidebarTutorialSection';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

export default function Sidebar({ open, version, jwtEnabled }) {
  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader />
      <Divider />
      <List>
        {sidebarItem('Console', <Terminal />, '/console', open)}
        {sidebarItem('Collections', <LibraryBooks />, '/collections', open)}
        <ListItem key={'Tutorial'} disablePadding sx={{ display: 'block' }}>
          <SidebarTutorialSection isSidebarOpen={open} />
        </ListItem>
        {sidebarItem('Datasets', <Animation />, '/datasets', open)}
        {sidebarItem('Telemetry', <QueryStats />, '/telemetry', open)}
        {sidebarItem('Access Tokens', <Key />, '/jwt', open, jwtEnabled)}
      </List>
      <List style={{ marginTop: `auto` }}>
        <ListItem>
          <Typography variant="caption">
            {open ? `Qdrant ` : ``}v{version}
          </Typography>
        </ListItem>
      </List>
    </Drawer>
  );
}

function sidebarItem(title, icon, linkPath, isOpen, enabled = true) {
  return (
    <ListItem key={title} disablePadding sx={{ display: 'block' }}>
      <Tooltip title={title} placement="right" arrow disableHoverListener={isOpen}>
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: isOpen ? 'initial' : 'center',
            px: 2.5,
          }}
          component={Link}
          to={linkPath}
          disabled={!enabled}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isOpen ? 3 : 'auto',
              justifyContent: 'center',
            }}
          >
            {icon}
          </ListItemIcon>
          <ListItemText primary={title} sx={{ opacity: isOpen ? 1 : 0 }} />
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
}

Sidebar.propTypes = {
  open: PropTypes.bool,
  version: PropTypes.string,
  jwtEnabled: PropTypes.bool,
};
