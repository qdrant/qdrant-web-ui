import React, { useContext, createContext, useState, useEffect } from "react";
import setupAxios from "../common/axios";

const DEFAULT_URL = "http://localhost:6333";

const DEFAULT_SETTINGS = {
  apiURL: DEFAULT_URL,
  apiKey: "",
};

//Write settings to local storage
const persistSettings = (settings) => {
  localStorage.setItem("settings", JSON.stringify(settings));
};

// Get existing Settings from Local Storage or set default values
const getPersistedSettings = () => {
  const settings = localStorage.getItem("settings");

  if (settings) return JSON.parse(settings);

  return DEFAULT_SETTINGS;
};

//React context to store the settings
const SettingsContext = createContext();

//React hook to access and modify the settings
export const useSettings = () => useContext(SettingsContext);

//Settings Context Provider
export const SettingsProvider = (props) => {
  //TODO: Switch to Reducer if we have more settings to track.
  const [settings, setSettings] = useState(getPersistedSettings());

  useEffect(() => {
    setupAxios(settings);
    persistSettings(settings);
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }} {...props} />
  );
};
