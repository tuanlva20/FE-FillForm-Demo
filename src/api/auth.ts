import axios from 'utils/axios';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupCodeRequest {
  email: string;
}

export interface ValidateCodeRequest {
  email: string;
  code: string;
}

export interface UserProfileResponseData {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider?: 'manual' | 'google';
  role?: 'user' | 'admin' | string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: UserProfileResponseData;
  // Optional expiry for access token in seconds epoch from /api/auth/me
  exp?: number;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post('/api/auth/login', data);
    return response.data;
  },

  googleLogin: async (data: GoogleLoginRequest): Promise<AuthResponse> => {
    const response = await axios.post('/api/auth/google', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axios.post('/api/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await axios.get('/api/auth/me');
    return response.data;
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post('/api/auth/logout');
    return response.data;
  },

  refresh: async (): Promise<AuthResponse> => {
    // Server should read refresh token from cookie
    const response = await axios.post('/api/auth/refresh');
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post('/api/auth/reset-password', { token, newPassword });
    return response.data;
  },

  sendSignupCode: async (data: SignupCodeRequest): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post('/api/signup/code', data);
    return response.data;
  },

  validateSignupCode: async (data: ValidateCodeRequest): Promise<AuthResponse> => {
    const response = await axios.post('/api/signup/validate', data);
    return response.data;
  }
};
