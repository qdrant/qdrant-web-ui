import React, { useContext, createContext, useState, useEffect, useMemo, Fragment } from 'react';
import PropTypes from 'prop-types';
import { axiosInstance, setupAxios } from '../common/axios';
import qdrantClient from '../common/client';
import { bigIntJSON } from '../common/bigIntJSON';
import { isTokenRestricted } from '../config/restricted-routes';

const DEFAULT_SETTINGS = {
  apiKey: '',
};

// Write settings to local storage
const persistSettings = (settings) => {
  localStorage.setItem('settings', bigIntJSON.stringify(settings));
};

// Get existing Settings from Local Storage or set default values
const getPersistedSettings = () => {
  const settings = localStorage.getItem('settings');

  if (settings) return bigIntJSON.parse(settings);

  return DEFAULT_SETTINGS;
};

// React context to store the settings
const ClientContext = createContext();

// React hook to access and modify the settings
export const useClient = () => {
  const context = useContext(ClientContext);

  if (!context) {
    throw new Error('useClient must be used within ClientProvider');
  }

  return {
    ...context,
    isRestricted: isTokenRestricted(context.settings.apiKey),
  };
};

// Client Context Provider
export const ClientProvider = ({ children }) => {
  // TODO: Switch to Reducer if we have more settings to track.
  const [settings, setSettings] = useState(getPersistedSettings());
  const { apiKey } = settings;

  // The REST client and the shared axios instance are both derived from the API key,
  // so they are rebuilt together, and only when the key changes.
  const client = useMemo(() => {
    setupAxios(axiosInstance, { apiKey });
    return qdrantClient({ apiKey });
  }, [apiKey]);

  useEffect(() => {
    persistSettings(settings);
  }, [settings]);

  const value = useMemo(() => ({ client, settings, setSettings }), [client, settings]);

  // Remount everything below the provider when the API key changes,
  // so all pages and contexts start over and refetch their data with the new key.
  return (
    <ClientContext.Provider value={value}>
      <Fragment key={apiKey}>{children}</Fragment>
    </ClientContext.Provider>
  );
};

ClientProvider.propTypes = {
  children: PropTypes.node,
};
