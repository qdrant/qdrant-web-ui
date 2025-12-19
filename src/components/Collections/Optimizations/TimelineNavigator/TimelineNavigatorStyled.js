import { Box, Slider } from '@mui/material';
import { styled } from '@mui/material/styles';

export const NAVIGATOR_HEIGHT = 60;

export const NavigatorContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: NAVIGATOR_HEIGHT,
  // marginTop: theme.spacing(2),
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  // todo: fix this (now used for overlay but cuts the slider thumb)
  overflow: 'hidden',
}));

export const ChartContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});

// todo: fix this
export const SliderOverlay = styled(Box)({
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
    height: NAVIGATOR_HEIGHT,
    borderRadius: 0,
    background: 'transparent',
    border: `1px solid ${theme.palette.background.paper}`,
    boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5)`,
  },
  '& .MuiSlider-rail': {
    opacity: 0,
  },
}));

