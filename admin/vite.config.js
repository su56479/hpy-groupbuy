import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 好朋友市集团购商城 - B端团长运营后台
export default defineConfig({
  base: '/admin/',
  plugins: [vue()],
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist'
  }
})
