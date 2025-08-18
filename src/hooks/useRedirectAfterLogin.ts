import { APP_DEFAULT_PATH } from 'config';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ==============================|| USE REDIRECT AFTER LOGIN HOOK ||============================== //

export default function useRedirectAfterLogin() {
  const navigate = useNavigate();

  const handleRedirectAfterLogin = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectPath = urlParams.get('redirect');
    
    let targetPath = APP_DEFAULT_PATH;
    
    if (redirectPath) {
      targetPath = decodeURIComponent(redirectPath);
    }

    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);
    
    navigate(targetPath, {
      replace: true
    });
  }, [navigate]);

  return {
    handleRedirectAfterLogin
  };
}
