import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { FormControlLabel, Switch, Typography } from '@mui/material';
import { usePolling } from '../../../hooks/usePolling';

/** localStorage key remembering whether auto-refresh is on; it is off unless turned on. */
const AUTO_REFRESH_STORAGE_KEY = 'qdrant-web-ui-cluster-monitor-auto-refresh';

const readAutoRefresh = () => {
  try {
    return localStorage.getItem(AUTO_REFRESH_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

const saveAutoRefresh = (enabled) => {
  try {
    localStorage.setItem(AUTO_REFRESH_STORAGE_KEY, String(enabled));
  } catch {
    // Storage may be unavailable (e.g. private mode); the toggle still works for this session.
  }
};

/**
 * Auto-refresh switch together with the polling it controls. The toggle state
 * lives here rather than in the cluster monitor, so switching it re-renders
 * only this control and not the whole (possibly large) cluster view.
 * @param {function(AbortSignal): Promise<*>} onRefresh - re-fetches the cluster state
 * @param {number} interval - delay in ms between refreshes
 * @param {boolean} forceEnabled - poll even when the switch is off (e.g. while resharding)
 * @param {boolean} paused - temporarily stop polling (e.g. while dragging a shard)
 * @return {React.JSX.Element}
 */
const AutoRefreshControl = ({ onRefresh, interval, forceEnabled = false, paused = false }) => {
  const [autoRefresh, setAutoRefresh] = useState(readAutoRefresh);

  usePolling(onRefresh, {
    enabled: (autoRefresh || forceEnabled) && !paused,
    interval,
  });

  const handleChange = (event) => {
    setAutoRefresh(event.target.checked);
    saveAutoRefresh(event.target.checked);
  };

  return (
    <FormControlLabel
      control={<Switch size="small" checked={autoRefresh} onChange={handleChange} />}
      label={<Typography variant="caption">Auto-refresh</Typography>}
      sx={{ mr: 0 }}
    />
  );
};

AutoRefreshControl.propTypes = {
  onRefresh: PropTypes.func.isRequired,
  interval: PropTypes.number.isRequired,
  forceEnabled: PropTypes.bool,
  paused: PropTypes.bool,
};

export default memo(AutoRefreshControl);
