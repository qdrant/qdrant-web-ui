import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardHeader, CardContent, Tooltip, useTheme } from '@mui/material';
import { extractSegmentsWithStatus, allocateSquares, getStatusColor, getStatusLabel } from './helpers';

const TOTAL_SQUARES = 186; // With this number it looks nice on a full screen view
const SQUARE_SIZE = 10;
const SQUARE_GAP = 2;

const ProgressGrid = ({ data, ...other }) => {
  const theme = useTheme();

  const squares = useMemo(() => {
    if (!data) return [];

    const segments = extractSegmentsWithStatus(data);
    return allocateSquares(segments, TOTAL_SQUARES);
  }, [data]);

  // Create empty squares if we have fewer than TOTAL_SQUARES
  const displaySquares = useMemo(() => {
    if (squares.length === 0) {
      return Array(TOTAL_SQUARES)
        .fill(null)
        .map((_, i) => ({ status: null, index: i }));
    }
    return squares;
  }, [squares]);

  return (
    <Card elevation={0} {...other}>
      <CardHeader
        title="Collection Progress"
        variant="heading"
        slotProps={{
          title: {
            sx: {
              pb: '0.4rem',
            },
          },
        }}
      />
      <CardContent sx={{ pt: 0, '&:last-child': { pb: 2 }, pl: 2, pr: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: `${SQUARE_GAP}px`,
            pt: 2,
          }}
        >
          {displaySquares.map((square, index) => (
            <Tooltip
              key={index}
              title={square.status ? `${getStatusLabel(square.status)} - ${square.segmentUuid?.slice(0, 8)}...` : ''}
              arrow
              placement="top"
            >
              <Box
                sx={{
                  width: SQUARE_SIZE,
                  height: SQUARE_SIZE,
                  borderRadius: 0.5,
                  backgroundColor: square.status ? getStatusColor(square.status, theme) : theme.palette.grey[200],
                  transition: 'transform 0.1s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.2)',
                  },
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

ProgressGrid.propTypes = {
  data: PropTypes.object,
};

export default ProgressGrid;
