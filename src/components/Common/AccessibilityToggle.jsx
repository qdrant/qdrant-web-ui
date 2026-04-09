import React, { useState } from 'react';
import { IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import { PersonStanding, Contrast, Check } from 'lucide-react';
import { useColorModeContext } from '../../context/color-context';

export default function AccessibilityToggle() {
  const theme = useTheme();
  const { colorMode, setColorMode } = useColorModeContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const isHighContrast = colorMode === 'high-contrast';

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleHighContrast = () => {
    setColorMode(isHighContrast ? 'dark' : 'high-contrast');
    handleClose();
  };

  return (
    <>
      <Tooltip title="Accessibility">
        <IconButton
          size="large"
          onClick={handleClick}
          sx={{
            color: isHighContrast ? theme.palette.warning.main : theme.palette.text.secondary,
          }}
        >
          <PersonStanding size={20} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleToggleHighContrast}>
          <ListItemIcon>
            <Contrast size={18} />
          </ListItemIcon>
          <ListItemText>High Contrast</ListItemText>
          {isHighContrast && <Check size={16} style={{ marginLeft: 8 }} />}
        </MenuItem>
      </Menu>
    </>
  );
}
