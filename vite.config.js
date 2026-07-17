import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During local dev, proxy /api/* to `vercel dev` (port 3000) so the serverless
// functions run exactly as they will in production. If you don't use `vercel dev`,
// see README for the alternative Express dev server.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
