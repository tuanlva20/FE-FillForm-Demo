import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project-imports
import { APP_DEFAULT_PATH } from 'config';
import useAuth from 'hooks/useAuth';

// types
import { GuardProps } from 'types/auth';

// ==============================|| GUEST GUARD ||============================== //

export default function GuestGuard({ children }: GuardProps) {
  const { isLoggedIn, rehydrate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn && typeof rehydrate === 'function') {
      void (async () => {
        try {
          const ok = await rehydrate();
          if (ok) {
            const urlParams = new URLSearchParams(window.location.search);
            const redirectPath = urlParams.get('redirect');
            let targetPath = APP_DEFAULT_PATH;
            if (redirectPath) targetPath = decodeURIComponent(redirectPath);
            navigate(targetPath, { replace: true });
          }
        } catch {}
      })();
    }

    if (isLoggedIn) {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirect');
      
      let targetPath = APP_DEFAULT_PATH;
      
      if (redirectPath) {
        targetPath = decodeURIComponent(redirectPath);
      } else if (location?.state?.from) {
        targetPath = location.state.from;
      }

      navigate(targetPath, {
        state: { from: '' },
        replace: true
      });
    }
  }, [isLoggedIn, navigate, location]);

  return children;
}
