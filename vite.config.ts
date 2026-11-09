import react from '@vitejs/plugin-react';
import { defineConfig, Plugin } from 'vite';

const cleanEntry = (): Plugin => ({
  name: 'clean-entry',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url?.startsWith('/clean/') && req.headers.accept?.includes('text/html')) {
        req.url = '/clean.html';
      }
      next();
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cleanEntry()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        clean: 'clean.html',
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Proxy the API to the backend so dev on :5173 is same-origin from the browser's point
    // of view. Without this, Vite serves index.html for every /api/* call and login fails
    // with "Failed to connect to server" — and pointing VITE_API_URL cross-origin instead
    // does not work either, because the auth cookie is sameSite:'strict'.
    proxy: {
      '/api': process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:8080',
    },
  },
});
