import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En GitHub Actions GITHUB_ACTIONS="true" → subpath /prueba/
// En local → base "/"
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/prueba/' : '/',
})
