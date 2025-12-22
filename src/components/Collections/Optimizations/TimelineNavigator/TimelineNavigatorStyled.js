import { Box, Slider } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

export const NAVIGATOR_HEIGHT = 60;

export const NavigatorContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: NAVIGATOR_HEIGHT,
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

export const ChartContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});

export const SliderWrapper = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  padding: '0',
});

export const RangeSlider = styled(Slider)(({ theme }) => ({
  height: '100%',
  padding: 0,
  '& .MuiSlider-thumb': {
    width: 8,
    height: NAVIGATOR_HEIGHT - 24,
    borderRadius: 4,
    backgroundColor: theme.palette.primary.dark,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='24' fill='${encodeURIComponent(
      theme.palette.text.primary
    )}' viewBox='0 0 24 24'%3E%3Cpath d='M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z' /%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    '&:hover, &.Mui-focusVisible': {
      boxShadow: 'none',
    },
  },
  '& .MuiSlider-track': {
    borderRadius: 0,
    border: `1px solid ${theme.palette.background.paper}`,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    maskImage: `linear-gradient(to right, 
      ${alpha(theme.palette.background.paper, 0.5)} 0%, ${alpha(theme.palette.background.paper, 0.5)} 100%, 
      transparent 100%, transparent 100%, 
      ${alpha(theme.palette.background.paper, 0.5)} 100%, ${alpha(theme.palette.background.paper, 0.5)} 100%)`,
    transform: 'translateY(0)',
  },
  '& .MuiSlider-rail': {
    opacity: 0,
  },
}));
