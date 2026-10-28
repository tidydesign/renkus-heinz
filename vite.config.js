import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Multi-page build: the home page at the root, the archived About Us page at /about/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        about: resolve(import.meta.dirname, 'about/index.html'),
      },
    },
  },
})
