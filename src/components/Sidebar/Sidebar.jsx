import React from 'react';
import PropTypes from 'prop-types';
import { styled, alpha } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import { List, Typography, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import { useClient } from '../../context/client-context';
import { Rocket, SquareTerminal, RectangleEllipsis, FileCode, KeyRound, BookMarked } from 'lucide-react';

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer)(() => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    overflowX: 'hidden',
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, isActive }) => ({
  display: 'flex',
  height: '40px',
  padding: '8px 12px',
  justifyContent: 'space-between',
  alignItems: 'center',
  alignSelf: 'stretch',
  borderRadius: '8px',
  '& .MuiListItemText-primary, & .MuiListItemIcon-root': {
    color: theme.palette.text.secondary,
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.05),
  },
  ...(isActive && {
    backgroundColor: alpha(theme.palette.primary.light, 0.08),
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '& .MuiListItemText-primary': {
      color: theme.palette.text.primary,
    },
  }),
}));

const StyledList = styled(List)(() => ({
  display: 'flex',
  padding: '24px 12px 0 12px',
  flexDirection: 'column',
  alignItems: 'flex-start',
  flex: '1 0 0',
  alignSelf: 'stretch',
}));

export default function Sidebar({ version, jwtEnabled, jwtVisible }) {
  const { isRestricted } = useClient();
  const location = useLocation();

  return (
    <Drawer variant="permanent">
      <DrawerHeader />
      <Divider />
      <StyledList>
        {!isRestricted && sidebarItem('Welcome', <Rocket size="16px" />, '/welcome', location)}
        {sidebarItem('Console', <SquareTerminal size="16px" />, '/console', location)}
        {sidebarItem('Collections', <RectangleEllipsis size="16px" />, '/collections', location)}
        {!isRestricted && sidebarItem('Tutorial', <BookMarked size="16px" />, '/tutorial', location)}

        {!isRestricted && sidebarItem('Datasets', <FileCode size="16px" />, '/datasets', location)}

        {!isRestricted &&
          jwtVisible &&
          sidebarItem('Access Tokens', <KeyRound size="16px" />, '/jwt', location, jwtEnabled)}
      </StyledList>

      <List style={{ marginTop: 'auto' }}>
        <ListItem>
          <Typography variant="caption">Qdrant v{version}</Typography>
        </ListItem>
      </List>
    </Drawer>
  );
}

function sidebarItem(title, icon, linkPath, location, enabled = true) {
  const isActive = location.pathname === linkPath || location.pathname.startsWith(linkPath + '/');

  return (
    <ListItem key={title} disablePadding sx={{ display: 'block' }}>
      <StyledListItemButton component={Link} to={linkPath} disabled={!enabled} isActive={isActive}>
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: 3,
            justifyContent: 'center',
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText primary={title} />
      </StyledListItemButton>
    </ListItem>
  );
}

Sidebar.propTypes = {
  version: PropTypes.string,
  jwtEnabled: PropTypes.bool,
  jwtVisible: PropTypes.bool,
};
