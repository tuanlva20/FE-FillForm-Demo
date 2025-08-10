import React, { createContext, useEffect, useReducer } from 'react';

// reducer - state management
import { LOGIN, LOGOUT } from 'contexts/auth-reducer/actions';
import authReducer from 'contexts/auth-reducer/auth';

// project-imports
import { authAPI } from 'api/auth';
import Loader from 'components/Loader';
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
  const getIsAppsPath = () => {
    if (typeof window === 'undefined') return false;
    return (window.location.pathname || '').startsWith('/apps/');
  };

  useEffect(() => {
    const isAppsPath = getIsAppsPath();
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
        }
      } catch (err) {
        dispatch({ type: LOGOUT });
      }
    };

    if (isAppsPath) {
      // On protected routes, ensure auth is hydrated
      if (!state.isLoggedIn || state.user == null) {
        void initAuth();
      }
    } else {
      // On public routes, avoid background refresh and mark initialized without network
      setAccessExpiry(null);
      if (state.isInitialized === false) {
        dispatch({ type: LOGOUT });
      }
    }
    // Also re-run when browser back/forward occurs
    const onPopState = () => {
      const nowApps = getIsAppsPath();
      if (nowApps && (!state.isLoggedIn || state.user == null)) {
        void initAuth();
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
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

  const isAppsPathRender = getIsAppsPath();
  if (isAppsPathRender && state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return (
    <JWTContext.Provider value={{ ...state, login, googleLogin, logout, register, resetPassword, updateProfile }}>
      {children}
    </JWTContext.Provider>
  );
};

export default JWTContext;
