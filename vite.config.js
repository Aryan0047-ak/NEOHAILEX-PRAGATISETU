import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/NEOHAILEX-PRAGATISETU/',
  server: { port: 5173, host: true },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      // Only the domain engine is gated. The React screens are exercised by
      // hand today, and a global threshold would either be meaningless (a low
      // number) or fail on day one. engine.js is where the money math lives.
      include: ['src/lib/engine.js'],
      thresholds: {
        statements: 95,
        branches: 75,
        functions: 95,
        lines: 95,
      },
    },
  },
})
