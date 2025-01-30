import { useLocation } from 'react-router-dom';
import { useClient } from '../context/client-context';
import { isPathRestricted } from '../config/restricted-routes';

export const useRouteAccess = () => {
  const location = useLocation();
  const { isRestricted } = useClient();

  // Extract path from hash route
  const path = location.pathname;


  return {
    // use this to show restricted message on unavailable routes
    isAccessDenied: isRestricted && isPathRestricted(path)
  };
};
