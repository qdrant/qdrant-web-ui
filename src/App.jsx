import React from 'react';
import { useRoutes } from 'react-router-dom';
import routes from './routes';
import useTitle from './components/UseTitle';
import { CssBaseline } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import StyledMain from './components/Common/StyledMain';
import { ColorModeProvider } from './context/color-context';

function NewApp() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const storedMode = localStorage.getItem('qdrant-web-ui-theme');

  const resolvedMode = ['dark', 'light'].includes(storedMode) ? storedMode : prefersDarkMode ? 'dark' : 'light';

  const routing = useRoutes(routes());
  useTitle('UI | Qdrant ');

  return (
    <ColorModeProvider initialMode={resolvedMode}>
      <CssBaseline />
      <StyledMain>{routing}</StyledMain>
    </ColorModeProvider>
  );
}

export default NewApp;
