/**
 * Segment status types for the progress grid
 */
export const SegmentStatus = {
  IDLE: 'idle',
  QUEUED: 'queued',
  RUNNING: 'running',
};

/**
 * Extract all segments from the API response with their statuses.
 * Does NOT include segments from completed optimizations as their status may have changed.
 * @param {Object} data - The API response data (result object)
 * @return {Array} Array of segments with { uuid, points_count, status }
 */
export const extractSegmentsWithStatus = (data) => {
  if (!data) return [];

  const segments = [];

  // Extract idle segments
  const idleSegments = data.idle_segments || [];
  idleSegments.forEach((segment) => {
    segments.push({
      uuid: segment.uuid,
      points_count: segment.points_count,
      status: SegmentStatus.IDLE,
    });
  });

  // Extract segments from queued optimizations
  const queued = data.queued || [];
  queued.forEach((optimization) => {
    const optSegments = optimization.segments || [];
    optSegments.forEach((segment) => {
      segments.push({
        uuid: segment.uuid,
        points_count: segment.points_count,
        status: SegmentStatus.QUEUED,
      });
    });
  });

  // Extract segments from running optimizations
  const running = data.running || [];
  running.forEach((optimization) => {
    const optSegments = optimization.segments || [];
    optSegments.forEach((segment) => {
      segments.push({
        uuid: segment.uuid,
        points_count: segment.points_count,
        status: SegmentStatus.RUNNING,
      });
    });
  });

  return segments;
};

/**
 * Calculate the total number of points across all segments
 * @param {Array} segments - Array of segments with points_count
 * @return {number} Total points count
 */
export const calculateTotalPoints = (segments) => {
  return segments.reduce((sum, segment) => sum + (segment.points_count || 0), 0);
};

/**
 * Allocate squares to segments proportionally based on their points_count.
 * Always returns exactly totalSquares squares.
 * Each square represents approximately 0.5% of the dataset (1/200).
 * Segments with < 0.5% may receive 0 squares.
 * @param {Array} segments - Array of segments with { uuid, points_count, status }
 * @param {number} totalSquares - Total number of squares to allocate (default 200)
 * @return {Array} Array of square objects with { status, segmentUuid }
 */
export const allocateSquares = (segments, totalSquares = 200) => {
  const totalPoints = calculateTotalPoints(segments);

  if (totalPoints === 0 || segments.length === 0) {
    return [];
  }

  // Calculate exact proportions and use floor for initial allocation
  const segmentAllocations = segments.map((segment) => {
    const exactProportion = (segment.points_count / totalPoints) * totalSquares;
    return {
      segment,
      floor: Math.floor(exactProportion),
      remainder: exactProportion - Math.floor(exactProportion),
    };
  });

  // Calculate how many squares we've allocated with floor
  const allocatedCount = segmentAllocations.reduce((sum, s) => sum + s.floor, 0);

  // Sort by remainder descending to distribute remaining squares fairly
  const sortedByRemainder = [...segmentAllocations].sort((a, b) => b.remainder - a.remainder);

  // Distribute remaining squares to segments with highest remainders
  const remainingSquares = totalSquares - allocatedCount;
  for (let i = 0; i < remainingSquares && i < sortedByRemainder.length; i++) {
    sortedByRemainder[i].floor += 1;
  }

  // Build the squares array
  const squares = [];
  segmentAllocations.forEach(({ segment, floor }) => {
    for (let i = 0; i < floor; i++) {
      squares.push({
        status: segment.status,
        segmentUuid: segment.uuid,
      });
    }
  });

  return squares;
};

/**
 * Get color for a segment status
 * @param {string} status - The segment status
 * @param {Object} theme - MUI theme object
 * @return {string} The color for the status
 */
export const getStatusColor = (status, theme) => {
  switch (status) {
    case SegmentStatus.IDLE:
      return theme.palette.success.main;
    case SegmentStatus.QUEUED:
      return theme.palette.grey[500];
    case SegmentStatus.RUNNING:
      return theme.palette.warning.main;
    default:
      return theme.palette.grey[300];
  }
};

/**
 * Get label for a segment status
 * @param {string} status - The segment status
 * @return {string} Human-readable label
 */
export const getStatusLabel = (status) => {
  switch (status) {
    case SegmentStatus.IDLE:
      return 'Idle';
    case SegmentStatus.QUEUED:
      return 'Queued';
    case SegmentStatus.RUNNING:
      return 'Running';
    default:
      return 'Unknown';
  }
};
