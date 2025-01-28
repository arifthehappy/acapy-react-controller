import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 7002,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
