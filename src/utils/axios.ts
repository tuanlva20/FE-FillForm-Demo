import axios, { AxiosRequestConfig } from 'axios';

const axiosServices = axios.create({ baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:3010/' });

// Define constants for mock services (replace with actual values or configuration)
const BYPASS_AUTH = false; // Set to true to bypass authentication for all requests
const MOCK_TOKEN = 'mock-token'; // Example mock token
const BYPASS_ENDPOINTS: string[] = []; // Add endpoints to bypass here, e.g., ['/api/users']
const MOCK_RESPONSES: { [key: string]: any } = {}; // Add mock responses here, e.g., {'/api/users': [{id: 1, name: 'Mock User'}]}

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.request.use(
  async (config) => {
    // If bypass auth is enabled, always set the mock token
    if (BYPASS_AUTH) {
      config.headers['Authorization'] = `Bearer ${MOCK_TOKEN}`;
      return config;
    }

    // Regular authentication flow
    const accessToken = localStorage.getItem('serviceToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip redirection to maintenance page if bypassing auth
    if (BYPASS_AUTH) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !window.location.href.includes('/login')) {
      window.location.pathname = '/maintenance/500';
    }
    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  // Check if this is an endpoint we want to bypass
  const bypassEndpoint = BYPASS_ENDPOINTS.find(endpoint => url.includes(endpoint));
  
  if (bypassEndpoint) {
    console.log(`📦 Bypassing API call to ${url} and returning mock data`);
    return MOCK_RESPONSES[bypassEndpoint];
  }

  // const res = await axiosServices.get(url, { ...config });
  const res = "";
  return res;
};

export const fetcherPost = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.post(url, { ...config });
  return res.data;
};
