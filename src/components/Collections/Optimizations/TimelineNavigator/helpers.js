import { parseTime } from '../Tree/helpers';

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
    const time = minTime + i * step;
    let count = 0;
    for (const item of data) {
      const start = parseTime(item.started_at);
      const end = parseTime(item.finished_at);
      if (time >= start && time <= end) {
        count++;
      }
    }
    points.push({ x: time, y: count });
  }

  return points;
};

