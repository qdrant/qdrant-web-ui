import React, { useContext, createContext, useState, useEffect } from 'react';
import { axiosInstance, setupAxios } from '../common/axios';
import qdrantClient from '../common/client';
import { bigIntJSON } from '../common/bigIntJSON';

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
export const useClient = () => useContext(ClientContext);

// Client Context Provider
export const ClientProvider = (props) => {
  // TODO: Switch to Reducer if we have more settings to track.
  const [settings, setSettings] = useState(getPersistedSettings());

  const client = qdrantClient(settings);

  useEffect(() => {
    setupAxios(axiosInstance, settings);
    persistSettings(settings);
  }, [settings]);

  return <ClientContext.Provider value={{ client, settings, setSettings }} {...props} />;
};
