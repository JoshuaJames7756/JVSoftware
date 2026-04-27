import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],

    resolve: {
        alias: {
            '@':           resolve(__dirname, 'src'),
            '@components': resolve(__dirname, 'src/components'),
            '@pages':      resolve(__dirname, 'src/pages'),
            '@hooks':      resolve(__dirname, 'src/hooks'),
            '@lib':        resolve(__dirname, 'src/lib'),
            '@assets':     resolve(__dirname, 'src/assets'),
        },
    },

    server: {
        port: 5173,
        proxy: {
            '/api': {
                target:       'http://localhost:3000',
                changeOrigin: true,
                secure:       false,
            },
        },
    },

    build: {
        target:    'es2015',
        outDir:    'dist',
        sourcemap: false,
        minify:    'esbuild',
        chunkSizeWarningLimit: 500,
    },

    envPrefix: 'VITE_',
});