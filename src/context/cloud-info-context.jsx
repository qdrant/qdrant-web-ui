import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { getFullPath } from '../lib/common-helpers';

const CloudInfoContext = createContext();

const DEFAULT_CLOUD_INFO_PATH = getFullPath('/cloud/data.json');

export function CloudInfoProvider({ children }) {
  const [cloudInfo, setCloudInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const cloudInfoPath = useMemo(() => {
    const pathFromEnv = import.meta.env?.VITE_CLOUD_INFO_PATH;
    if (typeof pathFromEnv === 'string' && pathFromEnv.trim().length > 0) {
      return pathFromEnv;
    }
    return DEFAULT_CLOUD_INFO_PATH;
  }, []);

  const fetchCloudInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(cloudInfoPath);

      if (!response.ok) {
        throw new Error(`Failed to load cloud info: ${response.status}`);
      }

      const data = await response.json();
      setCloudInfo(data);
    } catch (err) {
      console.error('Error fetching cloud info:', err);
      setError(err);
      setCloudInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [cloudInfoPath]);

  useEffect(() => {
    fetchCloudInfo();
  }, [fetchCloudInfo]);

  const value = useMemo(
    () => ({
      cloudInfo,
      error,
      isLoading,
      reload: fetchCloudInfo,
    }),
    [cloudInfo, error, isLoading, fetchCloudInfo]
  );

  return <CloudInfoContext.Provider value={value}>{children}</CloudInfoContext.Provider>;
}

CloudInfoProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useCloudInfo() {
  const context = useContext(CloudInfoContext);

  if (context === undefined) {
    throw new Error('useCloudInfo must be used within a CloudInfoProvider');
  }

  return context;
}
