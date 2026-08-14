import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

// 好朋友市集团购商城 - 移动端配置
// 后端会把构建产物挂在 /m 路径，因此 base 设为 '/m/'
export default defineConfig({
  base: '/m/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // 开发时通过 proxy 把 /api 与 /uploads 转发到后端
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2015',
    chunkSizeWarningLimit: 1500
  }
});
