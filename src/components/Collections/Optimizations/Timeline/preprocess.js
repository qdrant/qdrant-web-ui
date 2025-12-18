import { parseTime } from '../Tree/helpers';

/**
 * Preprocess the data to be used in the timeline:
 * - keep only top level elements with started_at and finished_at
 * - remove all optimizations shorter than 1 second
 * - remove all optimizations with no children
 * - consider finished_at of ongoing operations as a time of API response
 * @param {Object} data - The data to preprocess
 * @param {number} requestTime - The time of the request
 * @return {Array} The preprocessed data
 */
export const preprocess = (data, requestTime) => {
  if (!data) return [];

  const rawList = [...(data.ongoing || []), ...(data.completed || [])];
  const MIN_DURATION = 1000;

  return rawList
    .map((opt) => {
      // consider finished_at of ongoing operations as a time of API response
      const finishedAt = opt.finished_at || requestTime;
      // calculate duration if missing (in seconds)
      let durationSec = opt.duration_sec;
      if (typeof durationSec !== 'number') {
        const ms = parseTime(finishedAt) - parseTime(opt.started_at);
        // duration_sec in API is floating point seconds
        durationSec = ms / 1000;
      }
      return { ...opt, finished_at: finishedAt, duration_sec: durationSec };
    })
    .filter((opt) => {
      // keep only top level elements with started_at and finished_at
      if (!opt.started_at) return false;

      // remove all optimizations shorter than 1 second
      const duration = parseTime(opt.finished_at) - parseTime(opt.started_at);
      if (duration < MIN_DURATION) return false;

      // remove all optimizations with no children
      if (!opt.children || opt.children.length === 0) return false;

      return true;
    })
    .sort((a, b) => parseTime(a.started_at) - parseTime(b.started_at));
};
