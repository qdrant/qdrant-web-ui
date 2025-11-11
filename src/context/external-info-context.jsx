import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const ExternalInfoContext = createContext();

const DEFAULT_EXTERNAL_INFO_PATH = 'https://qdrant.tech/web-ui-info.json';

export function ExternalInfoProvider({ children }) {
  const [externalInfo, setExternalInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const externalInfoPath = useMemo(() => {
    const pathFromEnv =
      import.meta.env?.VITE_EXTERNAL_INFO_PATH ?? import.meta.env?.VITE_WEB_INFO_PATH;

    if (typeof pathFromEnv === 'string' && pathFromEnv.trim().length > 0) {
      return pathFromEnv;
    }
    return DEFAULT_EXTERNAL_INFO_PATH;
  }, []);

  const fetchExternalInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(externalInfoPath);

      if (!response.ok) {
        throw new Error(`Failed to load external info: ${response.status}`);
      }

      const data = await response.json();
      setExternalInfo(data);
    } catch (err) {
      console.error('Error fetching external info:', err);
      setError(err);
      setExternalInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [externalInfoPath]);

  useEffect(() => {
    fetchExternalInfo();
  }, [fetchExternalInfo]);

  const value = useMemo(
    () => ({
      externalInfo,
      error,
      isLoading,
      reload: fetchExternalInfo,
      banner: externalInfo?.banner,
      latestVersion: externalInfo?.latest_version,
    }),
    [externalInfo, error, isLoading, fetchExternalInfo],
  );

  return <ExternalInfoContext.Provider value={value}>{children}</ExternalInfoContext.Provider>;
}

ExternalInfoProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useExternalInfo() {
  const context = useContext(ExternalInfoContext);

  if (context === undefined) {
    throw new Error('useExternalInfo must be used within an ExternalInfoProvider');
  }

  return context;
}
