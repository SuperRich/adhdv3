import { defineConfig } from 'vite'

export default defineConfig({
  // ... other config options ...
  build: {
    target: 'esnext'  // This enables support for top-level await
  },
  esbuild: {
    target: 'esnext'  // This also needs to be set to esnext
  }
}) 