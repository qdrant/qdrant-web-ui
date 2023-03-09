
import Home from './pages/Home';
import Console  from './pages/Console'

const routes = () => [
  {
    path: '/',
    element:<Home/>,
    children: [
      {path: '/console', element: <Console /> },
    ]
  }
];

export default routes;
