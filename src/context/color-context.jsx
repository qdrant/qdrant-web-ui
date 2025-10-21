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
