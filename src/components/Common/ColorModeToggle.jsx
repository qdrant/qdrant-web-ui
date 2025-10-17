import React from 'react';
import { ToggleButtonGroup, ToggleButton, Tooltip, styled, alpha } from '@mui/material';
import { Sun, Moon } from 'lucide-react';
import { useColorModeContext } from '../../context/color-context';

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
  border: 'none',
  background: 'transparent',
  '&.Mui-selected': {
    borderRadius: theme.shape.borderRadius * 1,
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
  const { colorMode, setColorMode } = useColorModeContext();

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setColorMode(newMode);
    }
  };

  return (
    <StyledToggleButtonGroup value={colorMode} exclusive onChange={handleModeChange} size="small">
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
