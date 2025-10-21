import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const isDev = command === 'serve'
  const isBeta = process.env.BUILD_TARGET === 'beta'
  
  return {
    plugins: [react()],
    base: isBeta ? '/beta/' : '/',
    root: '.',
    publicDir: 'public',
    server: {
      port: 5173,
      open: false
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          beta: resolve(__dirname, 'beta-index.html')
        }
      }
    }
  }
}) 