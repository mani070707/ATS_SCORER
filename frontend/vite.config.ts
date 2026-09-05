import path from 'node:path'

import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '..'), '')
  const frontendEnv = loadEnv(mode, __dirname, '')
  const publicEnv = { ...rootEnv, ...frontendEnv }

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        publicEnv.VITE_API_BASE_URL || 'http://localhost:8000',
      ),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
        publicEnv.VITE_SUPABASE_URL || publicEnv.SUPABASE_URL || '',
      ),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
        publicEnv.VITE_SUPABASE_ANON_KEY || publicEnv.SUPABASE_ANON_KEY || '',
      ),
    },
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            supabase: ['@supabase/supabase-js'],
            query: ['@tanstack/react-query'],
            forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          },
        },
      },
    },
    server: { port: 5173 },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
      exclude: ['e2e/**', 'node_modules/**'],
    },
  }
})
