import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { axiosInstance as axios } from '../../../common/axios';
import { Box } from '@mui/material';
import ProgressGrid from './ProgressGrid/ProgressGrid';
import Timeline from './Timeline/Timeline';
import OptimizationsTree from './Tree/OptimizationsTree';

/** Poll interval while at least one optimization is running and the tab is visible (2–5s range). */
const POLL_ACTIVE_MS = 4000;
/** Max delay between retries after a failed poll (exponential backoff cap). */
const POLL_ERROR_RETRY_MAX_MS = 32000;

function isRequestCanceled(error) {
  return error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError';
}

const Optimizations = ({ collectionName }) => {
  const [data, setData] = useState(null);
  const [selectedOptimization, setSelectedOptimization] = useState(null);
  const [requestTime, setRequestTime] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const abortRef = useRef(null);
  const pollTimeoutRef = useRef(null);
  const lastRunningRef = useRef(false);
  const mountedRef = useRef(true);
  const pollErrorBackoffMsRef = useRef(POLL_ACTIVE_MS);

  const runFetch = useCallback(
    async ({ preserveSelection = false } = {}) => {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      if (!preserveSelection) {
        pollErrorBackoffMsRef.current = POLL_ACTIVE_MS;
        setIsRefreshing(true);
        setSelectedOptimization(null);
      }

      const url = `/collections/${encodeURIComponent(
        collectionName
      )}/optimizations?with=queued,completed,idle_segments`;

      try {
        const { data: next } = await axios.get(url, { signal: ac.signal });
        if (!mountedRef.current) return;

        setData(next);
        setRequestTime(Date.now());

        const result = next?.result;
        const hasRunning = Array.isArray(result?.running) && result.running.length > 0;
        lastRunningRef.current = hasRunning;
        pollErrorBackoffMsRef.current = POLL_ACTIVE_MS;

        clearTimeout(pollTimeoutRef.current);
        if (hasRunning && !document.hidden) {
          pollTimeoutRef.current = window.setTimeout(() => {
            pollTimeoutRef.current = null;
            void runFetch({ preserveSelection: true });
          }, POLL_ACTIVE_MS);
        }
      } catch (error) {
        if (isRequestCanceled(error)) return;
        console.error('Error fetching optimizations:', error);
        if (mountedRef.current && lastRunningRef.current && !document.hidden) {
          const delay = pollErrorBackoffMsRef.current;
          pollErrorBackoffMsRef.current = Math.min(pollErrorBackoffMsRef.current * 2, POLL_ERROR_RETRY_MAX_MS);
          pollTimeoutRef.current = window.setTimeout(() => {
            pollTimeoutRef.current = null;
            void runFetch({ preserveSelection: true });
          }, delay);
        }
      } finally {
        if (!preserveSelection && mountedRef.current) {
          setIsRefreshing(false);
        }
      }
    },
    [collectionName]
  );

  const fetchData = useCallback(() => {
    void runFetch({ preserveSelection: false });
  }, [runFetch]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    // this is used to stop polling when the user switches to another tab
    const onVisibilityChange = () => {
      if (document.hidden) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      } else if (lastRunningRef.current) {
        void runFetch({ preserveSelection: true });
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [runFetch]);

  useEffect(() => {
    void runFetch({ preserveSelection: false });
    return () => {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
      abortRef.current?.abort();
    };
  }, [collectionName, runFetch]);

  const handleOptimizationSelect = (optimization) => {
    if (optimization) {
      // Wrap the selected optimization in the expected format for OptimizationsTree
      // The optimization already has the progress tree spread into it from preprocess
      setSelectedOptimization({ result: { running: [optimization] } });
    } else {
      setSelectedOptimization(null);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <ProgressGrid data={data?.result} />
      <Timeline
        data={data?.result}
        requestTime={requestTime}
        onSelect={handleOptimizationSelect}
        selectedItem={selectedOptimization?.result?.running?.[0]}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
      />
      <OptimizationsTree data={selectedOptimization || data} requestTime={requestTime} />
    </Box>
  );
};

Optimizations.propTypes = {
  collectionName: PropTypes.string.isRequired,
};

export default memo(Optimizations);
