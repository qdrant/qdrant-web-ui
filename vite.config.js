import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import eslintPlugin from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: 'dist',
  },
  plugins: [
    reactRefresh(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
        // ...svgr options (https://react-svgr.com/docs/options/)
      },
    }),
    eslintPlugin({
      include: ['src/**/*.jsx', 'src/**/*.js', 'src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['node_modules/**', 'dist/**, build/**'],
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
  },
});
