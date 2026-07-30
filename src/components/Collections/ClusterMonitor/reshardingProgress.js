import { useEffect, useState } from 'react';
import { axiosInstance as axios } from '../../../common/axios';

/** How often the reported progress is re-read while a resharding operation runs. */
const POLL_INTERVAL_MS = 5000;

/**
 * Cluster metadata key the cluster manager reports the progress of a collection under.
 * @param {string} collectionName
 * @return {string}
 */
const progressKey = (collectionName) => encodeURIComponent(`_cluster_manager/resharding/progress/${collectionName}`);

/**
 * Progress of the ongoing resharding of a collection, as reported by the cluster
 * manager. Absent on clusters that do not report it, which answer with 404.
 * @param {string} collectionName
 * @return {Promise<?Object>}
 */
async function fetchReshardingProgress(collectionName) {
  const { data } = await axios.get(`/cluster/metadata/keys/${progressKey(collectionName)}`);
  // Metadata keys hold the stored value directly; `value` is the wrapper the
  // key is written with, accepted here in case reads keep it.
  return data?.result?.value ?? data?.result ?? null;
}

/**
 * Reads the resharding progress of a collection while `enabled`, keeping it
 * current as the operation advances through its stages.
 * @param {string} collectionName
 * @param {boolean} enabled
 * @return {?Object} progress, or null while none is reported
 */
export function useReshardingProgress(collectionName, enabled) {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setProgress(null);
      return undefined;
    }

    let cancelled = false;

    const read = async () => {
      try {
        const reported = await fetchReshardingProgress(collectionName);
        if (!cancelled) setProgress(reported);
      } catch (error) {
        // A missing key is the regular answer of a cluster that reports no
        // progress, so it stays silent and the banner shows its headline only.
        if (!cancelled) setProgress(null);
      }
    };

    read();
    const interval = setInterval(read, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [collectionName, enabled]);

  return progress;
}
