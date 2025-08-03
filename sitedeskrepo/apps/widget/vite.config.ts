import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/widget/',              // ← all built assets will be fetched under /widget/
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // ────────────────────────────────────────────────
  build: {
    outDir: 'dist',               // puts index.html & widget.js into apps/widget/dist
    rollupOptions: {
      // Since your index.html is already the widget shell, no extra inputs needed
      input: path.resolve(__dirname, 'index.html'),
      output: {
        entryFileNames: 'widget.js',       // the JS bundle name
        assetFileNames: '[name].[ext]',    // keep CSS/images with original names
        chunkFileNames: '[name].js',       // other code splits
      },
    }
  }
  // ────────────────────────────────────────────────
})
