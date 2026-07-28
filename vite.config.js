import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BUILD_STAMP = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true,
    // Listen on all interfaces — access via http://192.168.100.147:5175 when Ethernet is connected
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-${BUILD_STAMP}-[hash].js`,
        chunkFileNames: `assets/[name]-${BUILD_STAMP}-[hash].js`,
        assetFileNames: `assets/[name]-${BUILD_STAMP}-[hash][extname]`,
      },
    },
  },
})
