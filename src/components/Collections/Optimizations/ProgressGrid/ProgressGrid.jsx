import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardHeader, CardContent, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { extractSegmentsWithStatus, allocateSquares, getStatusColor, getStatusLabel } from './helpers';

const TOTAL_SQUARES = 172; // With this number it looks nice on a full screen view
const SQUARE_SIZE = 10;
const SQUARE_GAP = 3;

const ProgressGrid = ({ data, ...other }) => {
  const theme = useTheme();
  const [hoveredSegmentUuid, setHoveredSegmentUuid] = useState(null);

  const segments = useMemo(() => (data ? extractSegmentsWithStatus(data) : []), [data]);

  const squares = useMemo(() => {
    if (segments.length === 0) return [];
    return allocateSquares(segments, TOTAL_SQUARES);
  }, [segments]);

  const summary = useMemo(() => {
    if (!data)
      return {
        total: 0,
        totalPoints: 0,
        idle: { count: 0, points: 0 },
        queued: { count: 0, points: 0 },
        running: { count: 0, points: 0 },
      };
    const sumPoints = (segs) => (segs || []).reduce((s, seg) => s + (seg.points_count || 0), 0);
    const idleSegs = data.idle_segments || [];
    const queuedSegs = (data.queued || []).flatMap((opt) => opt.segments || []);
    const runningSegs = (data.running || []).flatMap((opt) => opt.segments || []);
    const total = idleSegs.length + queuedSegs.length + runningSegs.length;
    const totalPoints = sumPoints(idleSegs) + sumPoints(queuedSegs) + sumPoints(runningSegs);
    return {
      total,
      totalPoints,
      idle: { count: idleSegs.length, points: sumPoints(idleSegs) },
      queued: { count: queuedSegs.length, points: sumPoints(queuedSegs) },
      running: { count: runningSegs.length, points: sumPoints(runningSegs) },
    };
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
        action={
          <Tooltip
            title={
              <Box>
                <Typography variant="subtitle2">
                  {summary.total} segments &middot; {summary.totalPoints.toLocaleString()} points
                </Typography>
                <Typography variant="body2">
                  Idle: {summary.idle.count} ({summary.idle.points.toLocaleString()} points)
                </Typography>
                <Typography variant="body2">
                  Queued: {summary.queued.count} ({summary.queued.points.toLocaleString()} points)
                </Typography>
                <Typography variant="body2">
                  Running: {summary.running.count} ({summary.running.points.toLocaleString()} points)
                </Typography>
              </Box>
            }
            arrow
          >
            <IconButton size="small">
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
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
