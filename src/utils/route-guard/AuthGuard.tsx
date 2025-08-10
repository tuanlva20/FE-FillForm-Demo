import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project-imports
import useAuth from 'hooks/useAuth';

// types
import { GuardProps } from 'types/auth';

// ==============================|| AUTH GUARD ||============================== //

export default function AuthGuard({ children }: GuardProps) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only guard pages under /apps/*
    const pathname = location.pathname || '';
    const isProtected = pathname.startsWith('/apps/');
    if (isProtected && !isLoggedIn) {
      navigate('/auth/login', {
        state: { from: location.pathname },
        replace: true
      });
    }
  }, [isLoggedIn, navigate, location]);

  return children;
}
