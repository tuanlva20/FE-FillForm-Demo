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
  const { isLoggedIn, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If auth context is not yet initialized, show loader
  if (!isInitialized) {
    return <Loader />;
  }

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

  // If not logged in on a protected route, redirect to login
  if (!isLoggedIn) {
    const redirectPath = pathname !== '/' ? pathname : '/dashboard/default';
    const loginUrl = `/login?redirect=${encodeURIComponent(redirectPath)}`;
    return <Navigate to={loginUrl} state={{ from: pathname }} replace />;
  }

  // User is logged in and route is protected, allow access
  return children;
}
