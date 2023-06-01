import React from "react";
import { useRoutes } from "react-router-dom";
import routes from "./routes";
import useTitle from "./components/UseTitle";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

function NewApp() {
  const routing = useRoutes(routes());
  useTitle("UI | Qdrant ");

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <main style={{ height: "100vh" }}>{routing}</main>
    </ThemeProvider>
  );

}

export default NewApp;
