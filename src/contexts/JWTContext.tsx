import React, { createContext, useEffect, useReducer, useRef } from 'react';

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
  const hasInitializedAuth = useRef(false); // Thêm flag để track việc đã gọi getCurrentUser

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
          hasInitializedAuth.current = true; // Đánh dấu đã khởi tạo thành công
          console.log('🔐 JWTContext: Auth initialized successfully, staying on current page');
        } else {
          dispatch({ type: LOGOUT });
          hasInitializedAuth.current = true; // Đánh dấu đã khởi tạo (dù thất bại)
          // Chỉ redirect nếu đang ở protected route và không phải public route
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
        hasInitializedAuth.current = true; // Đánh dấu đã khởi tạo (dù thất bại)
        // Chỉ redirect nếu đang ở protected route và không phải public route
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
        // Try to initialize auth first on protected routes to preserve current URL for logged-in users
        void initAuth();
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
          // Nếu đã khởi tạo auth rồi, không gọi lại API
          if (hasInitializedAuth.current) {
            console.log('🔐 JWTContext: Auth already initialized, skipping rehydrate');
            return state.isLoggedIn;
          }
          
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
              hasInitializedAuth.current = true; // Đánh dấu đã khởi tạo
              console.log('🔐 JWTContext: Rehydrate successful');
              return true;
            }
            hasInitializedAuth.current = true; // Đánh dấu đã khởi tạo (dù thất bại)
            return false;
          } catch {
            hasInitializedAuth.current = true; // Đánh dấu đã khởi tạo (dù thất bại)
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
