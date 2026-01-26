import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardHeader, CardContent, Tooltip, useTheme } from '@mui/material';
import { extractSegmentsWithStatus, allocateSquares, getStatusColor, getStatusLabel } from './helpers';

const TOTAL_SQUARES = 172; // With this number it looks nice on a full screen view
const SQUARE_SIZE = 10;
const SQUARE_GAP = 3;

const ProgressGrid = ({ data, ...other }) => {
  const theme = useTheme();
  const [hoveredSegmentUuid, setHoveredSegmentUuid] = useState(null);

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
        title="Optimization Progress"
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
          {displaySquares.map((square, index) => {
            const isHighlighted = hoveredSegmentUuid && square.segmentUuid === hoveredSegmentUuid;
            return (
              <Tooltip
                key={index}
                title={
                  square.status
                    ? `Segment - ${getStatusLabel(square.status)} - ${square.pointsCount?.toLocaleString()} points`
                    : ''
                }
                arrow
                placement="top"
              >
                <Box
                  onMouseEnter={() => square.segmentUuid && setHoveredSegmentUuid(square.segmentUuid)}
                  onMouseLeave={() => setHoveredSegmentUuid(null)}
                  sx={{
                    width: SQUARE_SIZE,
                    height: SQUARE_SIZE,
                    borderRadius: isHighlighted ? '50%' : 0.5,
                    backgroundColor: square.status ? getStatusColor(square.status, theme) : theme.palette.grey[200],
                    transition: 'border-radius 0.1s ease-in-out',
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

ProgressGrid.propTypes = {
  data: PropTypes.object,
};

export default ProgressGrid;
