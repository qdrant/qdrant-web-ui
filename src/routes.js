import React from "react";
import Home from "./pages/Home";
import Console from "./pages/Console";
import Collections from "./pages/Collections";
import Collection from "./pages/Collection";
import Settings from "./pages/Settings";

const routes = () => [
  {
    path: "/",
    element: <Home />,
    children: [
      { path: "/console", element: <Console /> },
      { path: "/collections", element: <Collections /> },
      { path: "/collections/:collectionName", element: <Collection /> },
      { path: "/settings", element: <Settings /> },
    ],
  },
];

export default routes;
