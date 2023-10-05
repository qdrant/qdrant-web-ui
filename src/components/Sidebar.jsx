import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import { List, Typography, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { ExpandMore, LibraryBooks, Lightbulb, Terminal } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import { Accordion, AccordionDetails, AccordionSummary } from './Common/Accordion';

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
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader />
      <Divider />
      <List>
        <ListItem key={'Console'} disablePadding sx={{ display: 'block' }}>
          <Tooltip title={'Console'} placement={'right'} arrow={true}>
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
          </Tooltip>
        </ListItem>
        <ListItem key={'Collections'} disablePadding sx={{ display: 'block' }}>
          <Tooltip title={'Collections'} placement={'right'} arrow={true}>
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
          </Tooltip>
        </ListItem>
        {/* todo: uncomment when tutorial is ready*/}
        <ListItem key={'Tutorial'} disablePadding sx={{ display: 'block' }}>
          <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
            <Tooltip title={'Tutorial'} placement={'right'} arrow={true}>
              <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1bh-content" id="panel1bh-header">
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                  component={Link}
                  to="/tutorial"
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    <Lightbulb />
                  </ListItemIcon>
                  <ListItemText primary={'Tutorial'} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </AccordionSummary>
            </Tooltip>
            <AccordionDetails>
              <List sx={{ py: 0 }}>
                <ListItem key={'Quick Start'} disablePadding sx={{ display: 'block' }}>
                  <Tooltip title={'Quick Start'} placement={'right'} arrow={true}>
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        pr: 2.5,
                        pl: 5,
                      }}
                      component={Link}
                      to="/tutorial/quickstart"
                    >
                      <ListItemText primary={'Quick Start'} sx={{ opacity: open ? 1 : 0 }} />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
                <ListItem key={'Another page'} disablePadding sx={{ display: 'block' }}>
                  <Tooltip title={'Another page'} placement={'right'} arrow={true}>
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        pr: 2.5,
                        pl: 5,
                      }}
                      component={Link}
                      to="/tutorial/another-page"
                    >
                      <ListItemText primary={'Another page'} sx={{ opacity: open ? 1 : 0 }} />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
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
