import React from 'react';
import PropTypes from 'prop-types';
import { Divider, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import { useClient } from '../../context/client-context';
import { Rocket, SquareTerminal, RectangleEllipsis, FileCode, KeyRound, BookMarked } from 'lucide-react';
import {
  DrawerHeader,
  Drawer,
  StyledListItemButton,
  StyledList,
  StyledVersionListItem,
  StyledVersionText,
  StyledVersionList,
} from './SidebarStyled';
import { Logo } from '../Logo';

export default function Sidebar({ version, jwtEnabled, jwtVisible }) {
  const { isRestricted } = useClient();
  const location = useLocation();

  return (
    <Drawer variant="permanent">
      <DrawerHeader sx={{ justifyContent: 'start', paddingLeft: '24px', paddingRight: '24px' }}>
        <Logo width={120} />
      </DrawerHeader>
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

      <StyledVersionList>
        <StyledVersionListItem>
          <StyledVersionText variant="caption">Qdrant v{version}</StyledVersionText>
        </StyledVersionListItem>
      </StyledVersionList>
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
