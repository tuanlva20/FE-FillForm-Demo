import { useEffect, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

// project-imports
import Loader from 'components/Loader';
import useAuth from 'hooks/useAuth';

// types
import { GuardProps } from 'types/auth';

// ==============================|| AUTH GUARD ||============================== //

// Danh sách các routes public không cần authentication
const PUBLIC_ROUTES = [
  '/', // Landing page
  '/login', // Login page
  '/register', // Register page
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
  // Tất cả hooks phải được gọi ở đầu component
  const { isLoggedIn, isInitialized, rehydrate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine route visibility
  const pathname = location.pathname || '';
  const isPublicRoute = PUBLIC_ROUTES.some((route) => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });

  // Always allow public routes
  if (isPublicRoute) {
    return children;
  }

  // If auth is not initialized and route is protected, attempt one-time rehydrate
  const attemptedRef = useRef(false);
  useEffect(() => {
    if (!isPublicRoute && !isInitialized && !attemptedRef.current && typeof rehydrate === 'function') {
      attemptedRef.current = true;
      void rehydrate();
    }
  }, [isPublicRoute, isInitialized, rehydrate]);

  if (!isInitialized) {
    // Show loader only before we kick off rehydrate; after attempting, allow UI to render
    if (!attemptedRef.current) return <Loader />;
    return children;
  }

  // On protected routes: if not logged in after initialization, redirect to login
  if (!isLoggedIn) {
    const redirectPath = pathname !== '/' ? pathname : '/dashboard/default';
    const loginUrl = `/login?redirect=${encodeURIComponent(redirectPath)}`;
    return <Navigate to={loginUrl} state={{ from: pathname }} replace />;
  }

  // User is logged in and route is protected, allow access
  return children;
}
