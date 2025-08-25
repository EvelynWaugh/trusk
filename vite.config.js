import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
		 jsxRuntime: 'automatic',
	})
  ],
  build: {
    outDir: 'assets/dist',
	 target: 'es2020', // Modern ES modules support
  rollupOptions: {
      input: {
        'hotel-metabox': resolve(__dirname, 'src/index.tsx'),
      },
      output: {
        format: 'iife',
        name: 'TruskAdminApp',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        globals: {}
      },
      external: []
    },

    minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false,
	sourcemap: process.env.NODE_ENV === 'development',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@store': resolve(__dirname, 'src/store'),
      '@types': resolve(__dirname, 'src/types'),
      '@utils': resolve(__dirname, 'src/utils'),
	// Alias React to avoid conflicts with WordPress React
      'trusk-react': 'react',
      'trusk-react-dom': 'react-dom'
    }
  },
  server: {
    port: 3000,
    open: false
  }
});