import React from 'react';
import Home from './pages/Home';
import Console from './pages/Console';
import Collections from './pages/Collections';
import Collection from './pages/Collection';
import Visualize from './pages/Visualize';
import Tutorial from './pages/Tutorial';

const routes = () => [
  {
    path: '/',
    element: <Home />,
    children: [
      { path: '/', element: <Collections /> },
      { path: '/console', element: <Console /> },
      { path: '/collections', element: <Collections /> },
      { path: '/collections/:collectionName', element: <Collection /> },
      {
        path: '/collections/:collectionName/visualize',
        element: <Visualize />,
      },
      { path: '/tutorial', element: <Tutorial /> },
      { path: '/tutorial/:pageName', element: <Tutorial /> },
    ],
  },
];

export default routes;
