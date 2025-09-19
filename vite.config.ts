import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // for local development
  // base: '/dealpop-frontend/', // for GitHub Pages deployment
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
}) 