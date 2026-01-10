import { parseTime } from '../Tree/helpers';

/**
 * Calculate the min and max time range from timeline data with padding
 * @param {Array} data - Timeline data items with started_at property
 * @param {number} padding - Padding percentage (default 0.02 = 2%)
 * @return {{ minTime: number, maxTime: number }} Time range bounds
 */
export const calculateTimeRange = (data, padding = 0.02) => {
  const startTimes = data.map((item) => parseTime(item.started_at));
  let minTime = Math.min(...startTimes);
  let maxTime = Date.now();
  const range = maxTime - minTime;
  minTime -= range * padding;
  maxTime += range * padding;
  return { minTime, maxTime };
};

/**
 * Calculate activity density: how many tasks are running at each point in time
 * @param {Array} data - Timeline data items
 * @param {number} minTime - Start time in ms
 * @param {number} maxTime - End time in ms
 * @param {number} numPoints - Number of sample points
 * @return {Array} Array of {x, y} points for the chart
 */
export const calculateActivityDensity = (data, minTime, maxTime, numPoints = 100) => {
  const step = (maxTime - minTime) / numPoints;
  const points = [];

  for (let i = 0; i <= numPoints; i++) {
    const rangeStart = minTime + i * step;
    const rangeEnd = rangeStart + step;
    let count = 0;
    for (const item of data) {
      const start = parseTime(item.started_at);
      const end = parseTime(item.finished_at);
      // Calculate overlap between [rangeStart, rangeEnd] and [start, end]
      const overlapStart = Math.max(rangeStart, start);
      const overlapEnd = Math.min(rangeEnd, end);
      const overlapAmount = Math.max(0, overlapEnd - overlapStart);
      // Weight by fraction of overlap within the sample range
      count += overlapAmount / step;
    }
    points.push({ x: rangeStart, y: count });
  }

  return points;
};
