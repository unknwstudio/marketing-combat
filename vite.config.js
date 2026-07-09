import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Served at the domain root on Vercel, so base stays '/'.
export default defineConfig({
  plugins: [react()],
})
