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
        target: 'http://127.0.0.1:8845',
        changeOrigin: true,
        secure: false,
        ws: true,
        timeout: 120000,
        proxyTimeout: 120000,
        configure: (proxy, options) => {
          proxy.on('error', (err, _req, _res) => {
            console.warn('[Vite Proxy Warning]:', err.message);
          });
        }
      }
    }
  }
})
