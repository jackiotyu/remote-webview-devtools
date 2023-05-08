import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

const isDev = process.env.NODE_ENV !== 'production';

// https://vitejs.dev/config/
export default defineConfig({
  mode: process.env.NODE_ENV,
  build: {
    outDir: "../dist-web-flow",
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        chunkFileNames: 'static/js/[name].js',
        entryFileNames: 'static/js/[name].js',
        assetFileNames: 'static/[ext]/[name].[ext]'
      }
    },
    write: true,
    copyPublicDir: true,
    minify: 'terser',
    sourcemap: isDev ? 'inline' : false,
    reportCompressedSize: true,
    assetsInlineLimit: 10240,
  },
  publicDir: 'public',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ext': path.resolve(__dirname, '../src'),
    }
  }
})
