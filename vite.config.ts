import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxy = {
    '/service': { target: env.CHATNOW_API_TARGET || 'http://127.0.0.1:9000', changeOrigin: true },
    '/ws': { target: env.CHATNOW_WS_TARGET || 'ws://127.0.0.1:9001', ws: true, rewrite: (path: string) => path.replace(/^\/ws/, '/') },
  };
  return {
  plugins: [react()],
  server: { port: 5173, proxy },
  preview: { proxy },
  css: { modules: { localsConvention: 'camelCase' } },
  resolve: {
    alias: { '@': '/src' },
  },
  };
});
