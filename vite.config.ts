import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/EQUINOX/',
  resolve: {
    alias: { '@': '/src' },
  },
  define: {
    global: 'globalThis',
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          ui: ['react-markdown', 'react-syntax-highlighter', 'lucide-react'],
        },
      },
    },
  },
});
