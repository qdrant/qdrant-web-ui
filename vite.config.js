import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import eslintPlugin from 'vite-plugin-eslint';
import {rehypeMetaAsAttributes} from "./src/lib/rehype-meta-as-attributes";

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const mdx = await import('@mdx-js/rollup');

  return {
    base: './',
    // This changes the output dir from dist to build
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
        exclude: [
          'node_modules/**',
          'dist/**, build/**',
          '**/*.mdx',
          '**/*.md'],
      }),
      mdx.default({
        rehypePlugins: [
          rehypeMetaAsAttributes,
        ],
      }),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.js'],
    },
  }
});
