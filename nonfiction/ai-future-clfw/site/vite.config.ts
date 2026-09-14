import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // 記事 Markdown はサイト外の ../articles に置いている
      allow: ['..'],
    },
  },
})
