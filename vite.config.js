import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';

/* eslint-disable no-template-curly-in-string */
export default defineConfig(() => ({
  server: {
    port: 3000,
    proxy: {
      '/api/socket': 'ws://5.9.rastreamentofacil.app.br:8082/',
      '/api': 'http://5.9.rastreamentofacil.app.br:8082/',
    },
    // proxy: {
    //   '/api/socket': 'ws://104.251.222.187:8082/',
    //   '/api': 'http://104.251.222.187:8082/',
    // },
    // proxy: {
    //   '/api/socket': 'ws://localhost:8082',
    //   '/api': 'http://localhost:8082',
    // },
  },
  build: {
    outDir: 'build',
    optimizeDeps: { include: ['pdfmake/build/pdfmake', 'pdfmake/build/vfs_fonts'] },
  },
  plugins: [
    svgr(),
    react(),
    VitePWA({
      workbox: {
        navigateFallbackDenylist: [/^\/api/],
      },
      manifest: {
        short_name: 'RTK RASTREAMENTO',
        name: 'RTK RASTREAMENTO',
        theme_color: '#202124',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  optimizeDeps: { include: ['pdfmake/build/pdfmake', 'pdfmake/build/vfs_fonts'] },
}));
