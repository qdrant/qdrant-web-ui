import DragDrop from '@uppy/react/lib/DragDrop';
import { styled } from '@mui/material/styles';

export const StyledDragDrop = styled(DragDrop)(({ theme }) => ({
  '& .uppy-DragDrop-container': {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
}));
