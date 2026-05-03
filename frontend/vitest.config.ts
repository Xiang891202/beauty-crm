import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/__tests__/**/*.test.ts'],   // 只執行我們自己的單元測試
    exclude: [
      'e2e/**',                                 // 排除 Playwright
      'src/services/__tests__/**',              // 排除殘留的後端測試
      'node_modules/**',
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})