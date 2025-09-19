import React from 'react';
import DragDrop from '@uppy/react/lib/DragDrop';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

const StyledDragDropBase = styled(DragDrop)(({ theme }) => ({
  '& .uppy-DragDrop-container': {
    padding: '1.5rem 1rem',
    width: '100%',
    backgroundColor: 'transparent',
    border: `2px dashed ${theme.palette.divider}`,
    borderRadius: '8px',
    '& .uppy-DragDrop-inner': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 0,
      '&:before': {
        content: '""',
        display: 'block',
        width: '1.5rem',
        height: '1.5rem',
        // adding custom icon
        mask: `url(
            data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWZpbGUtdXAtaWNvbiBsdWNpZGUtZmlsZS11cCI+PHBhdGggZD0iTTE1IDJINmEyIDIgMCAwIDAtMiAydjE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY3WiIvPjxwYXRoIGQ9Ik0xNCAydjRhMiAyIDAgMCAwIDIgMmg0Ii8+PHBhdGggZD0iTTEyIDEydjYiLz48cGF0aCBkPSJtMTUgMTUtMy0zLTMgMyIvPjwvc3ZnPg==
          )`,
        maskSize: 'contain',
        maskPosition: 'center',
        maskRepeat: 'no-repeat',
        backgroundColor: theme.palette.primary.main,
        margin: '0.5rem',
      },
      '& .uppy-DragDrop-arrow': {
        display: 'none', // Hide the default Uppy icon
      },
    },
    '& .uppy-DragDrop-label': {
      fontSize: '1rem',
      fontWeight: 500,
      color: theme.palette.text.primary,
      lineHeight: 1.5,
      textAlign: 'center',
      '& .uppy-DragDrop-browse': {
        color: theme.palette.primary.main,
        textDecoration: 'underline',
        fontWeight: 400,
      },
    },
  },
}));

export const StyledDragDrop = (props) => (
  <Box sx={{ position: 'relative' }}>
    <StyledDragDropBase
      locale={{
        strings: {
          dropHereOr: '%{browse} or drop here',
          browse: 'Browse',
        },
      }}
      height="120px"
      {...props}
    />
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
        pointerEvents: 'none',
        marginTop: '-1rem',
      }}
    ></Box>
  </Box>
);
