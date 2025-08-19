import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project-imports
import Loader from 'components/Loader';
import useAuth from 'hooks/useAuth';

// types
import { GuardProps } from 'types/auth';

// ==============================|| AUTH GUARD ||============================== //

// Danh sách các routes public không cần authentication
const PUBLIC_ROUTES = [
  '/',           // Landing page
  '/login',      // Login page
  '/register',   // Register page  
  '/forgot-password',
  '/reset-password',
  '/check-mail',
  '/code-verification',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password', 
  '/auth/check-mail',
  '/auth/code-verification',
  '/maintenance',
  '/404',
  '/500'
];

export default function AuthGuard({ children }: GuardProps) {
  const { isLoggedIn, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);
  
  const performAuthCheck = useCallback(() => {
    const pathname = location.pathname || '';
    
    // Check if current route is public
    const isPublicRoute = PUBLIC_ROUTES.some(route => {
      if (route === '/') {
        return pathname === '/';
      }
      return pathname.startsWith(route);
    });

    // If route is protected and user is not logged in, redirect to login
    if (!isPublicRoute && !isLoggedIn && !hasRedirected.current) {
      const redirectPath = pathname !== '/' ? pathname : '/dashboard/default';
      const loginUrl = `/login?redirect=${encodeURIComponent(redirectPath)}`;
      
      hasRedirected.current = true;
      navigate(loginUrl, {
        state: { from: pathname },
        replace: true
      });
    }
  }, [location.pathname, isLoggedIn, isInitialized, navigate]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    // Add a small delay to ensure state has fully updated
    const timeoutId = setTimeout(() => {
      performAuthCheck();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [isLoggedIn, isInitialized, performAuthCheck]);

  // Reset redirect flag when location changes (new route)
  useEffect(() => {
    hasRedirected.current = false;
  }, [location.pathname]);

  // Determine route visibility for render phase as well
  const pathname = location.pathname || '';
  const isPublicRoute = PUBLIC_ROUTES.some((route) => (route === '/' ? pathname === '/' : pathname.startsWith(route)));

  // Always allow public routes
  if (isPublicRoute) return children;

  // On protected routes: show loader until auth is initialized to avoid blank page
  if (!isInitialized) return <Loader />;

  // If initialized but not logged in, block content while navigation happens in effect
  if (!isLoggedIn) return null;

  return children;
}
