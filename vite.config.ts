import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('@tanstack')) return 'query'
          if (id.includes('@radix-ui') || id.includes('/radix-ui/')) return 'radix'
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('react-hook-form') || id.includes('@hookform')) return 'form'
          if (id.includes('date-fns')) return 'date-fns'
          if (id.includes('zod')) return 'zod'
          // React, React DOM, React Router and their small runtime deps share the
          // default vendor chunk so their cross-imports don't form a cycle.
          return 'vendor'
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
