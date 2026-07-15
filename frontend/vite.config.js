import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isDocker = process.env.IS_DOCKER === 'true';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: isDocker ? 'http://backend:5002' : 'http://127.0.0.1:5002',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
