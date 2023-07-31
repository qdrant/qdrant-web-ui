import React from 'react';
import { useRoutes } from 'react-router-dom';
import routes from './routes';
import useTitle from './components/UseTitle';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from './theme';
import { CssBaseline } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ColorModeContext } from './context/color-context';

function NewApp() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = React.useState(
    localStorage.getItem('qdrant-web-ui-theme') || (prefersDarkMode ? 'dark' : 'light')
  );
  localStorage.setItem('qdrant-web-ui-theme', mode);

  const colorMode = React.useMemo(
    () => ({
      // The dark mode switch would invoke this method
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  const routing = useRoutes(routes());
  useTitle('UI | Qdrant ');

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <main style={{ height: '100vh' }}>{routing}</main>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default NewApp;
