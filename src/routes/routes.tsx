import { Home, Collection, Collections, Console } from "../pages";
import { appRoutes } from "./app";

export const browserRoutes = () => [
  {
    path: appRoutes.main,
    element: <Home />,
    children: [
      { path: appRoutes.console, element: <Console /> },
      { path: appRoutes.collections, element: <Collections /> },
      { path: appRoutes.collectionName, element: <Collection /> },
    ],
  },
];
