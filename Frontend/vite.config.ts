import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Skicka /api vidare till ASP.NET-backenden (http-profilen i launchSettings.json).
    proxy: {
      '/api': 'http://localhost:5265',
    },
  },
});
