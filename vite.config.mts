import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = `${env.VITE_APP_BASE_NAME}`;
  const PORT = 3000;

  return {
    server: {
      // this ensures that the browser opens upon server start
      open: true,
      // this sets a default port to 3000
      port: PORT,
      host: true
    },
    preview: {
      open: true,
      host: true
    },
    define: {
      global: 'window'
    },
    resolve: {
      alias: [
        // Force any residual v2 adapter imports to the v3 adapter for date-fns v3
        { find: '@mui/x-date-pickers/AdapterDateFns', replacement: '@mui/x-date-pickers/AdapterDateFnsV3' }
      ]
    },
    base: API_URL,
    plugins: [react(), tsconfigPaths()]
  };
});
