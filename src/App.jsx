import React from 'react';
import { useRoutes } from 'react-router-dom';
import routes from './routes';
import useTitle from './components/UseTitle';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from './theme';
import { CssBaseline } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ColorModeContext } from './context/color-context';
import StyledMain from './components/Common/StyledMain';

function NewApp() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [customMode, setCustomMode] = React.useState(
    localStorage.getItem('qdrant-web-ui-theme') || (prefersDarkMode ? 'dark' : 'light')
  );
  const [mode, setMode] = React.useState(customMode === 'auto' ? (prefersDarkMode ? 'dark' : 'light') : customMode);
  localStorage.setItem('qdrant-web-ui-theme', customMode);
  const colorMode = React.useMemo(
    () => ({
      // The dark mode switch would invoke this method
      toggleColorMode: () => {
        setCustomMode((prevMode) => (prevMode === 'light' ? 'dark' : prevMode === 'dark' ? 'auto' : 'light'));
      },
      mode: customMode,
    }),
    [customMode]
  );

  React.useEffect(() => {
    if (customMode === 'auto') {
      setMode(prefersDarkMode ? 'dark' : 'light');
    } else {
      setMode(customMode);
    }
  }, [customMode, prefersDarkMode]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  console.log(theme);

  const routing = useRoutes(routes());
  useTitle('UI | Qdrant ');

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <StyledMain>{routing}</StyledMain>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default NewApp;
