// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // ✅ Capacitor requires the build output in /dist
    outDir: 'dist',

    // Increase chunk warning threshold (your bundle is ~981kb)
    chunkSizeWarningLimit: 1500,

    rollupOptions: {
      output: {
        // Split vendor code for faster subsequent loads
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },

  server: {
    // Allow LAN access (useful for testing on real Android over WiFi)
    host: true,
    port: 5173,
  },
})

