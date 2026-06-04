import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function createApiProxy(target) {
  return {
    target,
    changeOrigin: true,
    secure: true,
    configure(proxy) {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.removeHeader('origin');
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 4310,
    proxy: {
      '/auth': createApiProxy('https://api.darrellvalentino.com'),
      '/education': createApiProxy('https://api.darrellvalentino.com'),
      '/admin': createApiProxy('https://api.darrellvalentino.com')
    }
  }
});
