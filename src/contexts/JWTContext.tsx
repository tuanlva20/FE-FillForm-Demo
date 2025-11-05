import React, { createContext, useEffect, useReducer, useRef } from 'react';

// reducer - state management
import { LOGIN, LOGOUT } from 'contexts/auth-reducer/actions';
import authReducer from 'contexts/auth-reducer/auth';

// project-imports
import { authAPI } from 'api/auth';
import { clearTokens, setAccessExpiry } from 'utils/authToken';

// types
import { AuthProps, JWTContextType } from 'types/auth';

// utils
import { logger } from '../utils/logger';

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
  const hasInitializedAuth = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      if (hasInitializedAuth.current) {
        return;
      }

      // Bypass auth init on public routes (e.g., landing, login...)
      try {
        const currentPath = window.location.pathname || '/';
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
        const isPublic = PUBLIC_ROUTES.some((r) => (r === '/' ? currentPath === '/' : currentPath.startsWith(r)));
        if (isPublic) {
          // Do not initialize on public routes; defer to guard-driven rehydrate when navigating to protected
          logger.log('🔐 JWTContext: Skipping auth init on public route');
          dispatch({ type: LOGOUT });
          hasInitializedAuth.current = true;
          return;
        }
      } catch {}

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
          hasInitializedAuth.current = true;
          logger.log('🔐 JWTContext: Auth initialized successfully');
        } else {
          dispatch({ type: LOGOUT });
          hasInitializedAuth.current = true;
        }
      } catch (err: any) {
        // Handle network errors gracefully
        if (err?.code === 'ECONNABORTED' || err?.code === 'ERR_NETWORK') {
          logger.warn('🔐 JWTContext: Backend not available, skipping auth initialization');
          dispatch({ type: LOGOUT });
          hasInitializedAuth.current = true;
          return;
        }

        logger.error('🔐 JWTContext: Auth initialization error:', err);
        dispatch({ type: LOGOUT });
        hasInitializedAuth.current = true;
      }
    };

    // Only initialize auth once
    if (!state.isInitialized && !hasInitializedAuth.current) {
      void initAuth();
    }
  }, [state.isInitialized]);

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
      // Send verification code instead of logging in immediately
      await authAPI.sendSignupCode({ email });
      // Store email for verification page
      localStorage.setItem('pendingVerificationEmail', email);
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

  const validateSignupCode = async (email: string, code: string) => {
    try {
      const response = await authAPI.validateSignupCode({ email, code });
      if (response?.success) {
        if (typeof response.exp === 'number') setAccessExpiry(response.exp);
        dispatch({
          type: LOGIN,
          payload: {
            isLoggedIn: true,
            user: response.data
          }
        });
        // Clear pending verification email
        localStorage.removeItem('pendingVerificationEmail');
        return response;
      } else {
        // Throw the actual error response from server instead of generic message
        throw response;
      }
    } catch (error: any) {
      throw error;
    }
  };

  const resendSignupCode = async (email: string) => {
    try {
      await authAPI.sendSignupCode({ email });
    } catch (error: any) {
      throw error;
    }
  };

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
            logger.log('🔐 JWTContext: Auth already initialized, skipping rehydrate');
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
              logger.log('🔐 JWTContext: Rehydrate successful');
              return true;
            }
            // Không thành công → coi như chưa đăng nhập
            dispatch({ type: LOGOUT });
            hasInitializedAuth.current = true; // Đánh dấu đã khởi tạo (dù thất bại)
            return false;
          } catch {
            // Lỗi → coi như chưa đăng nhập
            dispatch({ type: LOGOUT });
            hasInitializedAuth.current = true; // Đánh dấu đã khởi tạo (dù thất bại)
            return false;
          }
        },
        updateProfile,
        validateSignupCode,
        resendSignupCode
      }}
    >
      {children}
    </JWTContext.Provider>
  );
};

export default JWTContext;
