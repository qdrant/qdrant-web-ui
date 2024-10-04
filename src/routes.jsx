import React from 'react';
import Home from './pages/Home';
import Homepage from './pages/Homepage';
import Console from './pages/Console';
import Collections from './pages/Collections';
import Collection from './pages/Collection';
import Visualize from './pages/Visualize';
import Tutorial from './pages/Tutorial';
import Datasets from './pages/Datasets';
import Jwt from './pages/Jwt';
import Graph from './pages/Graph';
import Welcome from './pages/Welcome';

const routes = () => [
  {
    path: '/',
    element: <Home />,
    children: [
      { path: '/', element: <Homepage /> },
      { path: '/welcome', element: <Welcome /> },
      { path: '/console', element: <Console /> },
      { path: '/datasets', element: <Datasets /> },
      { path: '/collections', element: <Collections /> },
      { path: '/collections/:collectionName', element: <Collection /> },
      {
        path: '/collections/:collectionName/visualize',
        element: <Visualize />,
      },
      {
        path: '/collections/:collectionName/graph',
        element: <Graph />,
      },
      { path: '/tutorial', element: <Tutorial /> },
      { path: '/tutorial/:pageSlug', element: <Tutorial /> },
      { path: '/jwt', element: <Jwt /> },
    ],
  },
];

export default routes;
