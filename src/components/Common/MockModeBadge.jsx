import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { styled, keyframes, alpha } from '@mui/material/styles';
import { FlaskConical } from 'lucide-react';

// Soft attention-grabbing glow around the pill.
const glow = keyframes`
  0%   { box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25), 0 0 0 0 var(--mock-glow); }
  70%  { box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25), 0 0 0 10px transparent; }
  100% { box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25), 0 0 0 0 transparent; }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.35; }
`;

const Badge = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: theme.zIndex.tooltip + 1,
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.75, 1.5),
  borderRadius: 999,
  color: theme.palette.warning.contrastText,
  background: `linear-gradient(135deg, ${theme.palette.warning.light}, ${theme.palette.warning.dark})`,
  border: `1px solid ${alpha(theme.palette.warning.dark, 0.5)}`,
  cursor: 'default',
  userSelect: 'none',
  // Custom property consumed by the glow keyframes above.
  '--mock-glow': alpha(theme.palette.warning.main, 0.55),
  animation: `${glow} 2.4s ease-out infinite`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
}));

const Dot = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.warning.contrastText,
  animation: `${blink} 1.4s ease-in-out infinite`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
}));

// A small floating badge shown only when the app is running against the MSW
// mock backend (`npm run dev:msw`). It never renders in production builds
// because the flag is unset there.
const MockModeBadge = () => {
  if (import.meta.env.VITE_DEV_WITH_MSW !== 'true') {
    return null;
  }

  return (
    <Tooltip
      title={
        'This UI is running against mocked API data (MSW), not a real Qdrant instance. ' +
        'Data is fake and changes are not persisted.'
      }
      placement="top"
      arrow
    >
      <Badge role="status" aria-label="Mock data mode is active">
        <Dot />
        <FlaskConical size={16} aria-hidden="true" />
        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          Mock data
        </Typography>
      </Badge>
    </Tooltip>
  );
};

export default MockModeBadge;
