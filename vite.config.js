import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Base is the repo subpath on GitHub Pages for production builds, root in dev.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/marketing-combat/' : '/',
  plugins: [react()],
}))
