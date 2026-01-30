import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.png'],
      manifest: {
        name: 'LookTalkAI - AI Photo Analysis',
        short_name: 'LookTalkAI',
        description: 'AI analyzes your photos from unique personas and delivers creative interpretations as voice messages',
        theme_color: '#8B5CF6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        id: '/',
        categories: ['entertainment', 'photography', 'utilities'],
        lang: 'en',
        dir: 'ltr',
        icons: [
          {
            src: '/icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon.png',
            sizes: 'any',
            type: 'image/png',
            purpose: 'any'
          }
        ],
        shortcuts: [
          {
            name: 'Analyze Photo',
            short_name: 'Analyze',
            description: 'Upload and analyze a new photo',
            url: '/',
            icons: [
              {
                src: '/icon.png',
                sizes: '192x192'
              }
            ]
          }
        ],
        screenshots: [
          {
            src: '/icon.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gemini-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\.elevenlabs\.io/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'elevenlabs-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    port: 2010,
  },
  appType: 'spa',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});