import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { routes } from './routes';

export const RouteTitle = () => {
  const location = useLocation();
  
  useEffect(() => {
    const route = routes.find(route => route.path === location.pathname);
    if (route?.meta?.title) {
      document.title = `${route.meta.title} `;
    }
  }, [location]);

  return null;
};