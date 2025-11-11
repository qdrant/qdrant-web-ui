import React from 'react';
import PropTypes from 'prop-types';
import { Divider, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import { useClient } from '../../context/client-context';
import { 
  Rocket,
  SquareTerminal,
  RectangleEllipsis,
  FileCode,
  KeyRound,
  BookMarked,
  CornerUpLeft,
  CircleHelp,
  HardDriveUpload
} from 'lucide-react';
import {
  DrawerHeader,
  Drawer,
  StyledListItemButton,
  StyledList,
  StyledSidebarFooterListItem,
  StyledSidebarFooterText,
  StyledSidebarFooterList,
} from './SidebarStyled';
import { Logo } from '../Logo';
import { useVersion, useJwt } from '../../context/telemetry-context';
import { useCloudInfo } from '../../context/cloud-info-context';
import { useWebInfo } from '../../context/web-info-context';

export default function Sidebar() {
  const { version } = useVersion();
  const { jwtEnabled, jwtVisible } = useJwt();
  const { isRestricted } = useClient();
  const location = useLocation();
  const { cloudInfo } = useCloudInfo();
  const { latestVersion: availableUpdate } = useWebInfo();

  const normalizeVersion = (value) =>
    value
      ?.toString()
      .trim()
      .replace(/^v/i, '')
      .split('.')
      .map((part) => parseInt(part, 10))
      .filter((part) => !Number.isNaN(part));

  const isUpdateNewer = React.useMemo(() => {
    if (!availableUpdate || !version) {
      return false;
    }

    const nextParts = normalizeVersion(availableUpdate);
    const currentParts = normalizeVersion(version);
    const maxLength = Math.max(nextParts.length, currentParts.length);

    for (let index = 0; index < maxLength; index += 1) {
      const nextPart = nextParts[index] ?? 0;
      const currentPart = currentParts[index] ?? 0;

      if (nextPart > currentPart) {
        return true;
      }

      if (nextPart < currentPart) {
        return false;
      }
    }

    return false;
  }, [availableUpdate, version]);

  const updateLink = React.useMemo(() => {
    if (!availableUpdate) {
      return null;
    }

    const sanitizedVersion = availableUpdate.startsWith('v') ? availableUpdate : `v${availableUpdate}`;
    return `https://github.com/qdrant/qdrant/releases/tag/${sanitizedVersion}`;
  }, [availableUpdate]);

  const isActive = (linkTo) => location.pathname === linkTo || location.pathname.startsWith(linkTo + '/');

  return (
    <Drawer variant="permanent">
      <DrawerHeader sx={{ justifyContent: 'start', paddingLeft: '24px', paddingRight: '24px' }}>
        <Logo width={120} />
      </DrawerHeader>
      <Divider />
      <StyledList>
        {/* todo: what about isRestricted? */}
        {cloudInfo?.cloud_backlink &&
          <SidebarFooterItem
           title="Back to Cloud"
           icon={<CornerUpLeft size="16px" />} 
          linkTo={cloudInfo.cloud_backlink}
          active={isActive(cloudInfo.cloud_backlink)}
          disabled={!cloudInfo?.cloud_backlink} />}
        {!isRestricted && (
          <>
        <SidebarFooterItem 
        title="Welcome"
        icon={<Rocket size="16px" />}
        linkTo="/welcome"
        active={isActive('/welcome')}
        disabled={false} />
        <SidebarFooterItem
        title="Console"
        icon={<SquareTerminal size="16px" />}
        linkTo="/console"
        active={isActive('/console')}
        disabled={false} />
        <SidebarFooterItem 
        title="Collections"
        icon={<RectangleEllipsis size="16px" />}
        linkTo="/collections"
        active={isActive('/collections')}
        disabled={false} />
        </>
      )}
        {!isRestricted && (
        <SidebarFooterItem 
        title="Tutorial"
        icon={<BookMarked size="16px" />}
        linkTo="/tutorial"
        active={isActive('/tutorial')}
        disabled={false} />
        )}

        {!isRestricted && sidebarItem('Datasets', <FileCode size="16px" />, '/datasets', location)}

        {!isRestricted &&
          jwtVisible && (
          <SidebarFooterItem 
          title="Access Tokens"
          icon={<KeyRound size="16px" />}
          linkTo="/jwt"
          active={isActive('/jwt')}
          disabled={!jwtEnabled} />
        )}
      </StyledList>

      <StyledSidebarFooterList>
        {cloudInfo?.support_url && (
          <SidebarFooterItem 
          title="Get Support"
          icon={<CircleHelp size="16px" />}
          linkTo={cloudInfo.support_url}
          active={false}
          disabled={false} />
        )}

         {isUpdateNewer && updateLink && (
         <SidebarFooterItem
         title="Update Available"
         icon={<HardDriveUpload size="16px" />}
        linkTo={updateLink}
         active={false}
         disabled={false} />
         )}
      </StyledSidebarFooterList>

      <StyledSidebarFooterList>
        <StyledSidebarFooterListItem>
          <StyledSidebarFooterText variant="caption">Qdrant v{version}</StyledSidebarFooterText>
        </StyledSidebarFooterListItem>
      </StyledSidebarFooterList>
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

function SidebarFooterItem({ title, icon, linkTo, active = false, disabled = false }) {
  return (
<ListItem key={title} disablePadding sx={{ display: 'block' }}>
      <StyledListItemButton component={Link} to={linkTo} disabled={disabled} isActive={active}>
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

SidebarFooterItem.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  linkTo: PropTypes.string.isRequired,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
};

