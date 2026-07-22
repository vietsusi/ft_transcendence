import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5174,  // ← Change to a different port
    strictPort: false,  // ← Allow fallback if port is taken
    watch: {
      usePolling: true
    }
  },
  build: {
    sourcemap: false,
  },
//   logLevel: 'warn',
})