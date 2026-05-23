import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://127.0.0.1:8000',
      '/campaigns': 'http://127.0.0.1:8000',
      '/content': 'http://127.0.0.1:8000',
      '/referrals': 'http://127.0.0.1:8000',
      '/settings': 'http://127.0.0.1:8000',
      '/ai': 'http://127.0.0.1:8000'
    }
  }
})
