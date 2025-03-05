import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/compile': 'http://localhost:5000', // Proxy API requests to the backend
    },
  },
});