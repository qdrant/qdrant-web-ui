import React from 'react';
import PropTypes from 'prop-types';
import { Box, Divider, IconButton, ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
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
  HardDriveUpload,
  PanelLeftClose,
  PanelLeftOpen,
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

export default function Sidebar({ open, onToggle }) {
  const { version } = useVersion();
  const { jwtEnabled, jwtVisible } = useJwt();
  const { isRestricted } = useClient();
  const location = useLocation();
  const { cloudInfo } = useCloudInfo();
  const { latestVersion: availableUpdate } = useExternalInfo();
  const isUpdateNewer = React.useMemo(() => isSemverGreater(availableUpdate, version), [availableUpdate, version]);

  const updateLink = React.useMemo(() => buildReleaseLink(availableUpdate), [availableUpdate]);

  const isActive = (linkTo) => location.pathname === linkTo || location.pathname.startsWith(linkTo + '/');

  const anyLowerButtonVisible = cloudInfo?.support_url || (isUpdateNewer && updateLink);

  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader
        sx={{
          justifyContent: open ? 'flex-start' : 'center',
          pl: open ? 3 : 0,
          pr: open ? 3 : 0,
          overflow: 'hidden',
        }}
      >
        {open ? (
          <Logo height={32} />
        ) : (
          <Box sx={{ overflow: 'hidden', width: 30, lineHeight: 0 }}>
            <Logo height={32} />
          </Box>
        )}
      </DrawerHeader>
      <Divider />
      <StyledList>
        <ListItem sx={{ justifyContent: open ? 'flex-end' : 'center', py: 0.5, px: 1 }}>
          <Tooltip title={open ? 'Collapse sidebar' : 'Expand sidebar'} placement="right">
            <IconButton onClick={onToggle} size="small">
              {open ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </IconButton>
          </Tooltip>
        </ListItem>
        {cloudInfo?.cloud_backlink && (
          <SidebarItem
            title="Back to Cloud"
            icon={<CornerUpLeft size="16px" />}
            linkTo={cloudInfo.cloud_backlink}
            active={isActive(cloudInfo.cloud_backlink)}
            disabled={!cloudInfo?.cloud_backlink}
            open={open}
          />
        )}

        {!isRestricted && (
          <SidebarItem
            title="Welcome"
            icon={<Rocket size="16px" />}
            linkTo="/welcome"
            active={isActive('/welcome')}
            disabled={false}
            open={open}
          />
        )}
        <SidebarItem
          title="Console"
          icon={<SquareTerminal size="16px" />}
          linkTo="/console"
          active={isActive('/console')}
          disabled={false}
          open={open}
        />
        <SidebarItem
          title="Collections"
          icon={<RectangleEllipsis size="16px" />}
          linkTo="/collections"
          active={isActive('/collections')}
          disabled={false}
          open={open}
        />

        {!isRestricted && (
          <SidebarItem
            title="Tutorial"
            icon={<BookMarked size="16px" />}
            linkTo="/tutorial"
            active={isActive('/tutorial')}
            disabled={false}
            open={open}
          />
        )}

        {!isRestricted && (
          <SidebarItem
            title="Datasets"
            icon={<FileCode size="16px" />}
            linkTo="/datasets"
            active={isActive('/datasets')}
            disabled={false}
            open={open}
          />
        )}

        {!isRestricted && jwtVisible && (
          <SidebarItem
            title="Access Tokens"
            icon={<KeyRound size="16px" />}
            linkTo="/jwt"
            active={isActive('/jwt')}
            disabled={!jwtEnabled}
            open={open}
          />
        )}
      </StyledList>

      {anyLowerButtonVisible && (
        <StyledSidebarFooterList>
          {cloudInfo?.support_url && (
            <SidebarItem
              title="Get Support"
              icon={<CircleHelp size="16px" />}
              linkTo={cloudInfo.support_url}
              active={false}
              disabled={false}
              open={open}
            />
          )}

          {isUpdateNewer && updateLink && (
            <SidebarItem
              title="Update Available"
              icon={<HardDriveUpload size="16px" />}
              linkTo={updateLink}
              active={false}
              disabled={false}
              open={open}
            />
          )}
        </StyledSidebarFooterList>
      )}

      <StyledSidebarFooterList>
        <StyledSidebarFooterListItem>
          {open && <StyledSidebarFooterText variant="caption">Qdrant v{version || '???'}</StyledSidebarFooterText>}
        </StyledSidebarFooterListItem>
      </StyledSidebarFooterList>
    </Drawer>
  );
}

Sidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

function SidebarItem({ title, icon, linkTo, active = false, disabled = false, open = true }) {
  const button = (
    <StyledListItemButton component={Link} to={linkTo} disabled={disabled} isActive={active}>
      <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>{icon}</ListItemIcon>
      {open && <ListItemText primary={title} />}
    </StyledListItemButton>
  );

  return (
    <ListItem disablePadding sx={{ display: 'block' }}>
      {open ? (
        button
      ) : (
        <Tooltip title={title} placement="right" arrow>
          {button}
        </Tooltip>
      )}
    </ListItem>
  );
}

SidebarItem.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  linkTo: PropTypes.string.isRequired,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  open: PropTypes.bool,
};
