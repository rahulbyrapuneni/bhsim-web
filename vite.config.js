
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// ---VITE CONFIGURATION---
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: 'https://bhsim-api-rb1997-ongole-q76d.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
