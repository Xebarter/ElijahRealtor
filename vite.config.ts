import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:54321',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
      '/supabase': {
        target: 'http://localhost:54321',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/supabase/, ''),
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {},
    },
  },
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
