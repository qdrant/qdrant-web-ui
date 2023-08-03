import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import { List, Typography, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { LibraryBooks, Terminal } from '@mui/icons-material';

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

export default function Sidebar({ open, version }) {
  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader />
      <Divider />
      <List>
        <ListItem key={'Console'} disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
            }}
            component={Link}
            to="/console"
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              <Terminal />
            </ListItemIcon>
            <ListItemText primary={'Console'} sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
        <ListItem key={'Collections'} disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
            }}
            component={Link}
            to="/collections"
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              <LibraryBooks />
            </ListItemIcon>
            <ListItemText primary={'Collections'} sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
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

Sidebar.propTypes = {
  open: PropTypes.bool,
  version: PropTypes.string,
};
