import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api/pesapal': {
        target: 'https://cybqa.pesapal.com/pesapalv3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pesapal/, ''),
        timeout: 30000,
        proxyTimeout: 30000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/api/pesapal-live': {
        target: 'https://pay.pesapal.com/pesapalv3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pesapal-live/, ''),
        timeout: 30000,
        proxyTimeout: 30000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {},
    },
  },
  base: '/',
  build: {
    outDir: 'dist',
  },
});