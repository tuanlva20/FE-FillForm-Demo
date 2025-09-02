import { openSnackbar } from 'api/snackbar';
import axios, { AxiosRequestConfig } from 'axios';
import { clearTokens, ensureFreshToken } from './authToken';
import { logger } from './logger';

// Create axios instance with cookie-based auth and CSRF protection
const axiosServices = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:2412/',
  withCredentials: true,
  timeout: 10000 // 10 second timeout
});

// Configure Axios to automatically send CSRF header based on XSRF-TOKEN cookie
axiosServices.defaults.xsrfCookieName = 'XSRF-TOKEN';
axiosServices.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

// Define constants for mock services (replace with actual values or configuration)
const BYPASS_AUTH = false; // Set to true to bypass authentication for all requests
const BYPASS_ENDPOINTS: string[] = []; // Add endpoints to bypass here, e.g., ['/api/users']
const MOCK_RESPONSES: { [key: string]: any } = {}; // Add mock responses here, e.g., {'/api/users': [{id: 1, name: 'Mock User'}]}

// Prevent multiple redirects storm on repeated 401s
let isRedirectingToLogin = false;

// ==============================|| AXIOS INTERCEPTORS ||============================== //

axiosServices.interceptors.request.use(
  async (config) => {
    // Only refresh auth on protected /apps/* routes
    const url = (config.url || '').toString();
    const isAppsApi = url.startsWith('/apps/') || (url.includes('/api/') && window.location.pathname.startsWith('/apps/'));
    if (isAppsApi) {
      await ensureFreshToken(false);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosServices.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors gracefully
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      console.warn('Network error or timeout:', error.message);
      // Don't show error snackbar for network issues to avoid spam
      return Promise.reject(error);
    }

    if (BYPASS_AUTH) {
      return Promise.reject(error);
    }

    const originalRequest: any = error.config;
    const status = error.response?.status;
    const requestUrl: string = (originalRequest?.url || '').toString();

    // Handle /api/auth/me specifically: if 401 or 403, attempt a single refresh then retry /me
    if ((status === 401 || status === 403) && requestUrl.includes('/api/auth/me')) {
      if (!originalRequest._meRetry) {
        originalRequest._meRetry = true;
        const ok = await ensureFreshToken(true);
        if (ok) {
          return axiosServices(originalRequest);
        }
      }
      // If status is 403 here, there won't be a generic 401 handler below.
      // Redirect to login for protected routes to ensure user can re-authenticate.
      if (status === 403) {
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
        if (!isPublic && !isRedirectingToLogin) {
          isRedirectingToLogin = true;
          try {
            clearTokens();
          } catch {}
          const redirectPath = currentPath !== '/' ? currentPath : '/dashboard/default';
          const ts = Date.now();
          const loginUrl = `/login?redirect=${encodeURIComponent(redirectPath)}&ts=${ts}`;
          setTimeout(() => window.location.replace(loginUrl), 0);
          return Promise.reject(error);
        }
      }
      // fall through to generic 401 handling
    }

    if (status === 401) {
      // Retry up to 3 times attempting to refresh the session
      originalRequest._retryCount = originalRequest._retryCount || 0;
      while (originalRequest._retryCount < 3) {
        originalRequest._retryCount += 1;
        const ok = await ensureFreshToken(true);
        if (ok) {
          return axiosServices(originalRequest);
        }
      }
      try {
        openSnackbar({
          open: true,
          message: 'Phiên đăng nhập hết hạn/không hợp lệ. Vui lòng đăng nhập lại.',
          variant: 'alert',
          alert: { color: 'error' }
        } as any);
      } catch {}
      // Luôn redirect về /login nếu đang ở route cần authenticate (kể cả khi fail /me hoặc /refresh)
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

      if (!isPublic && !isRedirectingToLogin) {
        isRedirectingToLogin = true;
        try {
          clearTokens();
        } catch {}

        // Bypass cache và tránh loop
        const redirectPath = currentPath !== '/' ? currentPath : '/dashboard/default';
        const ts = Date.now();
        const loginUrl = `/login?redirect=${encodeURIComponent(redirectPath)}&ts=${ts}`;
        setTimeout(() => window.location.replace(loginUrl), 0);
        return Promise.reject(error);
      }
    }

    // Generic 403 handling: treat as unauthorized for protected routes and redirect to login
    if (status === 403) {
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
      if (!isPublic && !isRedirectingToLogin) {
        isRedirectingToLogin = true;
        try {
          clearTokens();
        } catch {}
        const redirectPath = currentPath !== '/' ? currentPath : '/dashboard/default';
        const ts = Date.now();
        const loginUrl = `/login?redirect=${encodeURIComponent(redirectPath)}&ts=${ts}`;
        setTimeout(() => window.location.replace(loginUrl), 0);
        return Promise.reject(error);
      }
    }
    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  // Check if this is an endpoint we want to bypass
  const bypassEndpoint = BYPASS_ENDPOINTS.find((endpoint) => url.includes(endpoint));

  if (bypassEndpoint) {
    logger.log(`📦 Bypassing API call to ${url} and returning mock data`);
    return MOCK_RESPONSES[bypassEndpoint];
  }

  // Keep original stub to avoid unintended side-effects for existing modules
  const res = '';
  return res;
};

export const fetcherPost = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.post(url, { ...config });
  return res.data;
};
