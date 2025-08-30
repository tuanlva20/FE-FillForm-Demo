import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project-imports
import { APP_DEFAULT_PATH } from 'config';
import useAuth from 'hooks/useAuth';

// types
import { GuardProps } from 'types/auth';

// utils
import { logger } from '../logger';

// ==============================|| GUEST GUARD ||============================== //

export default function GuestGuard({ children }: GuardProps) {
  const { isLoggedIn, rehydrate, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Chỉ gọi rehydrate nếu chưa khởi tạo và chưa đăng nhập
    if (!isInitialized && !isLoggedIn && typeof rehydrate === 'function') {
      logger.log('🔐 GuestGuard: Attempting to rehydrate auth...');
      void (async () => {
        try {
          const ok = await rehydrate();
          if (ok) {
            logger.log('🔐 GuestGuard: Rehydrate successful, redirecting...');
            const urlParams = new URLSearchParams(window.location.search);
            const redirectPath = urlParams.get('redirect');
            let targetPath = APP_DEFAULT_PATH;
            if (redirectPath) targetPath = decodeURIComponent(redirectPath);
            navigate(targetPath, { replace: true });
          } else {
            logger.log('🔐 GuestGuard: Rehydrate failed, staying on current page');
          }
        } catch (error) {
          logger.log('🔐 GuestGuard: Rehydrate error:', error);
        }
      })();
    }

    // Nếu đã đăng nhập, redirect về trang mặc định hoặc trang được chỉ định
    if (isLoggedIn) {
      logger.log('🔐 GuestGuard: User is logged in, redirecting...');
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
  }, [isLoggedIn, isInitialized, navigate, location]);

  return children;
}
