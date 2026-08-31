import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// vite.config runs in Node; declare the bits we touch without pulling in @types/node.
declare const process: { env: Record<string, string | undefined> };

// A visible build stamp so you can tell whether the deployed app actually
// updated. Vercel sets VERCEL_GIT_COMMIT_SHA on every build; locally we fall
// back to a timestamp.
const BUILD_ID =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
  new Date().toISOString().slice(0, 16).replace('T', ' ');

// https://vite.dev/config/
export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'],
      manifest: {
        name: 'JatinSitDown',
        short_name: 'SitDown',
        description: 'Sit down. Five minutes. Every day.',
        theme_color: '#17120d',
        background_color: '#17120d',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the whole app shell so a full session runs with no network.
        globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        // Lets us verify install/offline behavior in `npm run dev`.
        enabled: true,
        type: 'module',
      },
    }),
  ],
});
