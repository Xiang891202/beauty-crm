import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

export default defineConfig(({ command, mode }) => {
  // 根據 mode 決定後端目標埠
  const backendPort = mode === 'personal' ? 5001 : 5000;
  const target = `http://localhost:${backendPort}`;

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
        },
      },
    },
  };
});