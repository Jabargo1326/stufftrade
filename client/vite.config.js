import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During development the React site runs on :5173 and forwards /api and /uploads
// to the Express server on :3001, so you never have to deal with CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // lets you open the site from your phone on the same Wi-Fi
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
});
