import React, { createContext, useEffect, useReducer } from 'react';

// third-party
import { Chance } from 'chance';
import { jwtDecode } from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT } from 'contexts/auth-reducer/actions';
import authReducer from 'contexts/auth-reducer/auth';

// project-imports
import Loader from 'components/Loader';
import axios from 'utils/axios';

// types
import { AuthProps, JWTContextType } from 'types/auth';
import { KeyedObject } from 'types/root';

const chance = new Chance();

// Always bypass authentication by setting it to true
const BYPASS_AUTH = true;

// mock token with long validity
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRldiBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.L7CjWRnK2W9ODJ0kSMgX3nMVXMxhzqgRZUTh8_OW1y8';

// constant
const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

const verifyToken: (st: string) => boolean = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }
  const decoded: KeyedObject = jwtDecode(serviceToken);
  /**
   * Property 'exp' does not exist on type '<T = unknown>(token: string, options?: JwtDecodeOptions | undefined) => T'.
   */
  return decoded.exp > Date.now() / 1000;
};

const setSession = (serviceToken?: string | null) => {
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
    axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
  } else {
    localStorage.removeItem('serviceToken');
    delete axios.defaults.headers.common.Authorization;
  }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext<JWTContextType | null>(null);

export const JWTProvider = ({ children }: { children: React.ReactElement }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        // Check for existing session token
        const serviceToken = window.localStorage.getItem('serviceToken');
        if (serviceToken && verifyToken(serviceToken)) {
          // Use existing token
          setSession(serviceToken);
          
          // Set mock user data
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user: {
                id: '1',
                email: 'khaosat@gmail.com',
                name: 'Khaosat User',
                avatar: "",
                role: 'admin'
              }
            }
          });
        } else {
          dispatch({
            type: LOGOUT
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: LOGOUT
        });
      }
    };

    init();
  }, []);

  const login = async (email: string, password: string) => {
    // Use mock token and bypass authentication completely
    try {
      setSession(MOCK_TOKEN);
      dispatch({
        type: LOGIN,
        payload: {
          isLoggedIn: true,
          user: {
            id: '1',
            email: email || 'khaosat@gmail.com',
            name: 'Khaosat User',
            avatar: "",
            role: 'admin'
          }
        }
      });
    } catch (error) {
      throw new Error('Authentication failed');
    }
  };

  // Rest of the code remains unchanged
  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    // todo: this flow need to be recode as it not verified
    const id = chance.bb_pin();
    
    // Simply return success without making API call
    setSession(MOCK_TOKEN);
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user: {
          id,
          email,
          name: `${firstName} ${lastName}`,
          role: 'user'
        }
      }
    });
  };

  const logout = () => {
    setSession(null);
    dispatch({ type: LOGOUT });
  };

  const resetPassword = async (email: string) => {
    console.log('Password reset bypassed for:', email);
    // Don't return anything to match the Promise<void> type
  };

  const updateProfile = () => {};

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return <JWTContext.Provider value={{ ...state, login, logout, register, resetPassword, updateProfile }}>{children}</JWTContext.Provider>;
};

export default JWTContext;
