import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Divider, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link, useLocation } from 'react-router';

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
  HardDriveUpload,
  Settings,
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
import { useExternalInfo } from '../../context/external-info-context';
import { isSemverGreater, buildReleaseLink } from '../../lib/common-helpers';

export default function Sidebar({ variant = 'permanent', open = false, onClose }) {
  const { version } = useVersion();
  const { jwtEnabled, jwtVisible } = useJwt();
  const { isRestricted } = useClient();
  const location = useLocation();
  const { cloudInfo } = useCloudInfo();
  const { latestVersion: availableUpdate } = useExternalInfo();
  const isUpdateNewer = React.useMemo(() => isSemverGreater(availableUpdate, version), [availableUpdate, version]);

  const updateLink = React.useMemo(() => buildReleaseLink(availableUpdate), [availableUpdate]);

  const isActive = (linkTo) => location.pathname === linkTo || location.pathname.startsWith(linkTo + '/');

  // the temporary (phone) menu closes on every item click, including the already active page
  const onItemClick = variant === 'temporary' ? onClose : undefined;

  const anyLowerButtonVisible = cloudInfo?.support_url || (isUpdateNewer && updateLink);

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      // a temporary drawer's root is the full-screen modal, so it must not get the sidebar width
      sx={variant === 'temporary' ? { width: 'auto' } : undefined}
    >
      <DrawerHeader sx={{ justifyContent: 'start', paddingLeft: '24px', paddingRight: '24px' }}>
        <Logo width={120} />
      </DrawerHeader>
      <Divider />
      <StyledList>
        {cloudInfo?.cloud_backlink && (
          <SidebarItem
            onClick={onItemClick}
            title="Back to Cloud"
            icon={<CornerUpLeft size="16px" />}
            linkTo={cloudInfo.cloud_backlink}
            active={isActive(cloudInfo.cloud_backlink)}
            disabled={!cloudInfo?.cloud_backlink}
          />
        )}

        {!isRestricted && (
          <SidebarItem
            onClick={onItemClick}
            title="Welcome"
            icon={<Rocket size="16px" />}
            linkTo="/welcome"
            active={isActive('/welcome')}
            disabled={false}
          />
        )}
        <SidebarItem
          onClick={onItemClick}
          title="Console"
          icon={<SquareTerminal size="16px" />}
          linkTo="/console"
          active={isActive('/console')}
          disabled={false}
        />
        <SidebarItem
          onClick={onItemClick}
          title="Collections"
          icon={<RectangleEllipsis size="16px" />}
          linkTo="/collections"
          active={isActive('/collections')}
          disabled={false}
        />

        {!isRestricted && (
          <SidebarItem
            onClick={onItemClick}
            title="Tutorial"
            icon={<BookMarked size="16px" />}
            linkTo="/tutorial"
            active={isActive('/tutorial')}
            disabled={false}
          />
        )}

        {!isRestricted && sidebarItem('Datasets', <FileCode size="16px" />, '/datasets', location, true, onItemClick)}

        {!isRestricted && jwtVisible && (
          <SidebarItem
            onClick={onItemClick}
            title="Access Tokens"
            icon={<KeyRound size="16px" />}
            linkTo="/jwt"
            active={isActive('/jwt')}
            disabled={!jwtEnabled}
          />
        )}

        <SidebarItem
          onClick={onItemClick}
          title="Settings"
          icon={<Settings size="16px" />}
          linkTo="/settings"
          active={isActive('/settings')}
          disabled={false}
        />
      </StyledList>

      {/* on phones the header shows only an icon for this button */}
      {variant === 'temporary' && cloudInfo?.scale_url && (
        <Box sx={{ px: 1.5, pb: 2 }}>
          <Button
            component={Link}
            to={cloudInfo.scale_url}
            target="_blank"
            variant="contained"
            color="primary"
            fullWidth
            endIcon={<Rocket size={16} />}
            onClick={onItemClick}
          >
            Upgrade Cluster
          </Button>
        </Box>
      )}

      {anyLowerButtonVisible && (
        <StyledSidebarFooterList>
          {cloudInfo?.support_url && (
            <SidebarItem
              onClick={onItemClick}
              title="Get Support"
              icon={<CircleHelp size="16px" />}
              linkTo={cloudInfo.support_url}
              active={false}
              disabled={false}
            />
          )}

          {isUpdateNewer && updateLink && (
            <SidebarItem
              onClick={onItemClick}
              title="Update Available"
              icon={<HardDriveUpload size="16px" />}
              linkTo={updateLink}
              active={false}
              disabled={false}
            />
          )}
        </StyledSidebarFooterList>
      )}

      <StyledSidebarFooterList>
        <StyledSidebarFooterListItem>
          <StyledSidebarFooterText variant="caption">Qdrant v{version || '???'}</StyledSidebarFooterText>
        </StyledSidebarFooterListItem>
      </StyledSidebarFooterList>
    </Drawer>
  );
}

Sidebar.propTypes = {
  variant: PropTypes.oneOf(['permanent', 'temporary']),
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

function sidebarItem(title, icon, linkPath, location, enabled = true, onClick) {
  const isActive = location.pathname === linkPath || location.pathname.startsWith(linkPath + '/');

  return (
    <ListItem key={title} disablePadding sx={{ display: 'block' }}>
      <StyledListItemButton component={Link} to={linkPath} disabled={!enabled} isActive={isActive} onClick={onClick}>
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

function SidebarItem({ title, icon, linkTo, active = false, disabled = false, onClick }) {
  return (
    <ListItem key={title} disablePadding sx={{ display: 'block' }}>
      <StyledListItemButton component={Link} to={linkTo} disabled={disabled} isActive={active} onClick={onClick}>
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

SidebarItem.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  linkTo: PropTypes.string.isRequired,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};
