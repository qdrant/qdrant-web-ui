import { styled } from '@mui/material/styles';
import { Slider } from '@mui/material';

export const StyledSlider = styled(Slider)(({ theme }) => ({
  // show slider mark labels on the edges aligned with the slider
  '& .MuiSlider-markLabel': {
    '&:nth-of-type(4)': {
      transform: 'none',
      left: 0,
    },
    '&:nth-last-of-type(2)': {
      left: 'auto !important',
      transform: 'none',
      right: '-3px',
    },
  },
  // make the slider marks more visible
  '& .MuiSlider-mark': {
    backgroundColor: theme.palette.primary.main,
    height: 12,
    width: 2,
    borderRadius: '50%',
  },
}));

export default StyledSlider;
