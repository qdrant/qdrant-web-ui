import React from "react";
import { useRoutes } from 'react-router-dom';
import routes from './routes';
// import useTitle from "./components/UseTitle";

function NewApp() {
  const routing = useRoutes(routes());
  // useTitle("UI | Qdrant ");

  return (
    <main style={{ height: "100vh" }}>
      {routing}
    </main>
  );
}

export default NewApp;
