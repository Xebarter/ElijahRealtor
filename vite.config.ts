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
    exclude: ['lucide-react', 'firebase/app', 'firebase/messaging'],
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
      scss: {
        additionalData: `@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        
        :root {
          // Your existing root styles
        }
        
        // Your existing global styles
        `, 
      },
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
          firebase: ['firebase/app', 'firebase/messaging'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
