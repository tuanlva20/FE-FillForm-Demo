import { useEffect, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

// project-imports
import Loader from 'components/Loader';
import useAuth from 'hooks/useAuth';

// utils

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

  // If auth is not initialized, check if we have any auth data first
  if (!isInitialized) {
    // Check if we have any auth-related data in localStorage or cookies
    const hasAuthData = () => {
      try {
        // Check for common auth storage keys
        const authKeys = ['auth', 'token', 'user', 'session'];
        const hasLocalStorage = authKeys.some(key => 
          localStorage.getItem(key) || localStorage.getItem(`auth:${key}`)
        );
        
        // Check for auth cookies
        const hasCookies = document.cookie.includes('auth') || 
                          document.cookie.includes('token') || 
                          document.cookie.includes('session');
        
        return hasLocalStorage || hasCookies;
      } catch {
        return false;
      }
    };
    
    // If no auth data exists, redirect to login immediately without loading
    if (!hasAuthData()) {
      const redirectPath = pathname !== '/' ? pathname : '/dashboard/default';
      const loginUrl = `/login?redirect=${encodeURIComponent(redirectPath)}`;
      return <Navigate to={loginUrl} state={{ from: pathname }} replace />;
    }
    
    // If we have auth data but auth is not initialized, show loading
    return <Loader />;
  }

  // On protected routes: if not logged in after initialization, redirect to login immediately
  if (!isLoggedIn) {
    const redirectPath = pathname !== '/' ? pathname : '/dashboard/default';
    const loginUrl = `/login?redirect=${encodeURIComponent(redirectPath)}`;
    return <Navigate to={loginUrl} state={{ from: pathname }} replace />;
  }

  // User is logged in and route is protected, allow access
  return children;
}
