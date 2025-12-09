import { parseTime } from '../Tree/helpers';

// This file should convert raw API output of process optimizations into a timeline format
// it should:
// - keep only top level elements with started_at and finished_at
// - remove all optimizations shorter than 1 second
// - remove all optimizations with no children
// - concider finished_at of ongoing operations as a time of API response

export const preprocess = (data, requestTime) => {
  if (!data) return [];

  const rawList = [...(data.ongoing || []), ...(data.completed || [])];

  return rawList
    .map((opt) => {
      // concider finished_at of ongoing operations as a time of API response
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
      if (duration < 1000) return false;

      // remove all optimizations with no children
      if (!opt.children || opt.children.length === 0) return false;

      return true;
    })
    .sort((a, b) => parseTime(a.started_at) - parseTime(b.started_at));
};
