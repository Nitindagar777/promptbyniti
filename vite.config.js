import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 7744, // Unique port for this project
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8845',
        changeOrigin: true
      }
    }
  }
})
