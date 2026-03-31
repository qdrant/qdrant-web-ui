import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardHeader, CardContent, Tooltip, Typography, IconButton, useTheme } from '@mui/material';
import { Eye } from 'lucide-react';
import {
  extractSegmentsWithStatus,
  allocateSquares,
  getStatusColor,
  getStatusLabel,
  countSegmentsByStatus,
} from './helpers';

const TOTAL_SQUARES = 172; // With this number it looks nice on a full screen view
const SQUARE_SIZE = 10;
const SQUARE_GAP = 3;

const ProgressGrid = ({ data, highContrast, onToggleHighContrast, ...other }) => {
  const theme = useTheme();
  const [hoveredSegmentUuid, setHoveredSegmentUuid] = useState(null);

  const squares = useMemo(() => {
    if (!data) return [];

    const segments = extractSegmentsWithStatus(data);
    return allocateSquares(segments, TOTAL_SQUARES);
  }, [data]);

  const counts = useMemo(() => countSegmentsByStatus(data), [data]);

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
        action={
          <Tooltip title={highContrast ? 'Switch to default colors' : 'Switch to colorblind-friendly colors'}>
            <IconButton size="small" onClick={onToggleHighContrast} sx={{ opacity: highContrast ? 1 : 0.5 }}>
              <Eye size={18} />
            </IconButton>
          </Tooltip>
        }
        slotProps={{
          title: {
            sx: {
              pb: '0.4rem',
            },
          },
        }}
      />
      <CardContent sx={{ pt: 0, '&:last-child': { pb: 2 }, pl: 2, pr: 2 }}>
        {counts.total > 0 && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {counts.idle}/{counts.total} segments idle
            </Typography>
            {counts.running > 0 && (
              <Typography variant="body2" color="text.secondary">
                {counts.running} running
              </Typography>
            )}
            {counts.queued > 0 && (
              <Typography variant="body2" color="text.secondary">
                {counts.queued} queued
              </Typography>
            )}
          </Box>
        )}
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
                    backgroundColor: square.status
                      ? getStatusColor(square.status, theme, highContrast)
                      : highContrast
                        ? '#CCCCCC'
                        : theme.palette.grey[200],
                    transition: 'border-radius 0.1s ease-in-out',
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>
        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
          {[
            { status: 'idle', label: 'Idle' },
            { status: 'running', label: 'Running' },
            { status: 'queued', label: 'Queued' },
          ].map(({ status, label }) => (
            <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: 0.5,
                  backgroundColor: getStatusColor(status, theme, highContrast),
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

ProgressGrid.propTypes = {
  data: PropTypes.object,
  highContrast: PropTypes.bool,
  onToggleHighContrast: PropTypes.func,
};

export default ProgressGrid;
