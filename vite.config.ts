import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const isDev = command === 'serve'
  
  return {
    plugins: [react()],
    base: '/', // Always use root path since we're serving everything from root
    root: '.',
    publicDir: 'public',
    server: {
      port: 5173,
      open: false
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: resolve(__dirname, 'index.html')
      }
    }
  }
}) 