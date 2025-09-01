import React from 'react';
import { ToggleButtonGroup, ToggleButton, Tooltip, styled, alpha } from '@mui/material';
import { Sun, Moon } from 'lucide-react';
import { ColorModeContext } from '../../context/color-context';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius[1],
  border: `0.5px solid ${theme.palette.divider}`,
  background: theme.palette.background.default,
  padding: '2px',
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  display: 'flex',
  width: '64px',
  height: '28px',
    padding: '6px 21px',
  justifyContent: 'center',
  alignItems: 'center',
  //   gap: '10px',
  border: 'none',
  background: 'transparent',
  '&.Mui-selected': {
    borderRadius: theme.shape.borderRadius[1],
    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
    background: theme.palette.background.paper,
  },
}));

const StyledIcon = styled('div')(() => ({
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export default function ColorModeToggle() {
  const colorMode = React.useContext(ColorModeContext);

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      // If we're already in the desired mode, do nothing
      if (colorMode.mode === newMode) {
        return;
      }
      
      // If we're in auto mode, we need to toggle to get to the desired mode
      if (colorMode.mode === 'auto') {
        // Toggle once to get to light, then again if we want dark
        colorMode.toggleColorMode(); // auto -> light
        if (newMode === 'dark') {
          colorMode.toggleColorMode(); // light -> dark
        }
      } else {
        // We're in light or dark mode, toggle to get to the other
        colorMode.toggleColorMode();
      }
    }
  };

  // Map the current mode to our toggle button values
  const getCurrentMode = () => {
    if (colorMode.mode === 'auto') {
      return 'light'; // Default to light when in auto mode
    }
    return colorMode.mode;
  };

  return (
    <StyledToggleButtonGroup
      value={getCurrentMode()}
      exclusive
      onChange={handleModeChange}
      size="small"
    >
      <StyledToggleButton value="dark">
        <Tooltip title="Dark Mode">
          <StyledIcon>
            <Moon size={20} />
          </StyledIcon>
        </Tooltip>
      </StyledToggleButton>
      <StyledToggleButton value="light">
        <Tooltip title="Light Mode">
          <StyledIcon>
            <Sun size={20} />
          </StyledIcon>
        </Tooltip>
      </StyledToggleButton>
    </StyledToggleButtonGroup>
  );
}
