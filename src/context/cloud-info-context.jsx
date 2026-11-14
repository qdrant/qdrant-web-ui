import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { getFullPath } from '../lib/common-helpers';
import { axiosInstance as axios } from '../common/axios';

const CloudInfoContext = createContext();

const CLOUD_INFO_FILE = getFullPath('/cloud/data.json');
// A relative path is resolved against the page, as axios would resolve it against the API base URL.
const DEFAULT_CLOUD_INFO_PATH = CLOUD_INFO_FILE.startsWith('/')
  ? CLOUD_INFO_FILE
  : new URL(CLOUD_INFO_FILE, window.location.href).href;

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
      const response = await axios.get(cloudInfoPath);
      setCloudInfo(response.data);
    } catch (err) {
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
