import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '../theme';

const ColorModeContext = createContext();

export function ColorModeProvider({ children, initialMode }) {
  const [colorMode, setColorMode] = useState(initialMode);

  useEffect(() => {
    localStorage.setItem('qdrant-web-ui-theme', colorMode);
  }, [colorMode]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: colorMode,
        },
      }),
    [colorMode]
  );

  useEffect(() => {
    // Accept messages as: { "mode": "light"|"dark" } or { qdrantTheme: "light"|"dark" } or raw 'light'/'dark'
    const handleMessage = (event) => {
      let payload = event.data;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch (err) {
          console.log('could not parse message payload as JSON', err);
        }
      }
      const mode = payload?.mode ?? payload?.qdrantTheme ?? payload;
      if (mode === 'light' || mode === 'dark') {
        setColorMode(mode);
        event.source.postMessage(`{ status: 'success', message: 'Color mode changed to ${mode}' }`, event.origin);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setColorMode]);

  return (
    <ColorModeContext.Provider value={{ colorMode, setColorMode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}

ColorModeProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialMode: PropTypes.string.isRequired,
};

export function useColorModeContext() {
  return useContext(ColorModeContext);
}
