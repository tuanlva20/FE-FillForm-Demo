import React, { createContext, useEffect, useReducer } from 'react';

// reducer - state management
import { LOGIN, LOGOUT } from 'contexts/auth-reducer/actions';
import authReducer from 'contexts/auth-reducer/auth';

// project-imports
import { authAPI } from 'api/auth';
import { clearTokens, setAccessExpiry } from 'utils/authToken';

// types
import { AuthProps, JWTContextType } from 'types/auth';

// constant
const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

// No-op for cookie-based sessions. Kept for symmetry if needed in future.
const setSession = () => {};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext<JWTContextType | null>(null);

export const JWTProvider = ({ children }: { children: React.ReactElement }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        if (response?.success) {
          if (typeof response.exp === 'number') setAccessExpiry(response.exp);
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user: response.data
            }
          });
        } else {
          dispatch({ type: LOGOUT });
          // If we are on a protected route, force redirect to login (handles cases where guard hasn't mounted yet)
          try {
            const pathname = window.location.pathname || '/';
            const PUBLIC_ROUTES = [
              '/',
              '/login',
              '/register',
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
            const isPublic = PUBLIC_ROUTES.some((r) => (r === '/' ? pathname === '/' : pathname.startsWith(r)));
            if (!isPublic) {
              const redirectPath = pathname !== '/' ? pathname : '/dashboard/default';
              const ts = Date.now();
              const loginUrl = `/login?redirect=${encodeURIComponent(redirectPath)}&ts=${ts}`;
              window.location.assign(loginUrl);
            }
          } catch {}
        }
      } catch (err) {
        dispatch({ type: LOGOUT });
        // If we are on a protected route, force redirect to login (handles cases where guard hasn't mounted yet)
        try {
          const pathname = window.location.pathname || '/';
          const PUBLIC_ROUTES = [
            '/',
            '/login',
            '/register',
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
          const isPublic = PUBLIC_ROUTES.some((r) => (r === '/' ? pathname === '/' : pathname.startsWith(r)));
          if (!isPublic) {
            const redirectPath = pathname !== '/' ? pathname : '/dashboard/default';
            const ts = Date.now();
            const loginUrl = `/login?redirect=${encodeURIComponent(redirectPath)}&ts=${ts}`;
            window.location.assign(loginUrl);
          }
        } catch {}
      }
    };

    // Helper function to check if we should skip auth initialization
    const shouldSkipAuthInit = () => {
      if (typeof window === 'undefined') return false;
      const pathname = window.location.pathname || '';
      
      // Skip auth initialization for these specific routes
      const skipRoutes = [
        '/',           // Landing page
        '/login',      
        '/register',   
        '/forgot-password',
        '/reset-password',
        '/check-mail',
        '/code-verification',
        '/auth/login',
        '/auth/register',
        '/auth/forgot-password',
        '/auth/reset-password', 
        '/auth/check-mail',
        '/auth/code-verification'
      ];
      
      return skipRoutes.some(route => {
        if (route === '/') {
          return pathname === '/';
        }
        return pathname.startsWith(route);
      });
    };

    // Only initialize auth if needed
    if (!state.isInitialized) {
      const pathname = window.location.pathname || '/';
      const isProtected = !shouldSkipAuthInit();
      console.log('🔐 JWTContext: Auth not initialized, checking route...', {
        pathname,
        shouldSkip: !isProtected
      });

      if (isProtected) {
        // Immediate redirect to login to avoid being stuck on protected page while BE returns 401
        console.log('🔐 JWTContext: Protected route detected, redirecting to /login first...');
        dispatch({ type: LOGOUT });
        const ts = Date.now();
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}&ts=${ts}`;
        try {
          window.location.replace(loginUrl);
        } catch {
          window.location.assign(loginUrl);
        }
      } else {
        console.log('🔐 JWTContext: Public route detected, skipping auth init');
        dispatch({ type: LOGOUT });
      }
    }

    // Listen for route changes and conditionally initialize auth
    const handleRouteChange = () => {
      // If we're now on a protected route and auth is not properly initialized
      if (!shouldSkipAuthInit() && (!state.isLoggedIn || state.user == null)) {
        void initAuth();
      }
    };

    // Listen for browser navigation (back/forward)
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await authAPI.login({ email, password });
      const me = await authAPI.getCurrentUser();
      if (me?.success) {
        if (typeof me.exp === 'number') setAccessExpiry(me.exp);
        dispatch({
          type: LOGIN,
          payload: {
            isLoggedIn: true,
            user: me.data
          }
        });
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      throw new Error(error?.message || 'Authentication failed');
    }
  };

  const googleLogin = async (idToken: string) => {
    try {
      await authAPI.googleLogin({ idToken });
      const me = await authAPI.getCurrentUser();
      if (me?.success) {
        if (typeof me.exp === 'number') setAccessExpiry(me.exp);
        dispatch({
          type: LOGIN,
          payload: {
            isLoggedIn: true,
            user: me.data
          }
        });
      } else {
        throw new Error('Google login failed');
      }
    } catch (error: any) {
      throw new Error(error?.message || 'Google login failed');
    }
  };

  const register = async (email: string, password: string, firstNameOrName: string, confirmPassword?: string) => {
    try {
      // Treat provided name as full name
      const fullName = [firstNameOrName].filter(Boolean).join(' ').trim();
      await authAPI.register({ email, password, confirmPassword: confirmPassword || password, name: fullName });
      const me = await authAPI.getCurrentUser();
      if (me?.success) {
        if (typeof me.exp === 'number') setAccessExpiry(me.exp);
        dispatch({
          type: LOGIN,
          payload: {
            isLoggedIn: true,
            user: me.data
          }
        });
      } else {
        throw new Error('Register failed');
      }
    } catch (error: any) {
      // Re-throw original error so form can parse structured error response
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // ignore
    } finally {
      clearTokens();
      dispatch({ type: LOGOUT });
    }
  };

  const resetPassword = async (email: string) => {
    await authAPI.forgotPassword(email);
  };

  const updateProfile = () => {};

  return (
    <JWTContext.Provider
      value={{
        ...state,
        login,
        googleLogin,
        logout,
        register,
        resetPassword,
        // Rehydrate method used on login pages to auto-continue if session exists
        rehydrate: async (): Promise<boolean> => {
          try {
            const me = await authAPI.getCurrentUser();
            if (me?.success) {
              if (typeof me.exp === 'number') setAccessExpiry(me.exp);
              dispatch({
                type: LOGIN,
                payload: {
                  isLoggedIn: true,
                  user: me.data
                }
              });
              return true;
            }
            return false;
          } catch {
            return false;
          }
        },
        updateProfile
      }}
    >
      {children}
    </JWTContext.Provider>
  );
};

export default JWTContext;
