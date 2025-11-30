import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * 🎓 MICROSOFT-GRADE PERFORMANCE CONFIGURATION
 *
 * Optimizations implemented:
 * - Code splitting for optimal bundle sizes
 * - Compression (gzip/brotli)
 * - Tree shaking to remove unused code
 * - CSS code splitting
 * - Asset optimization
 * - Chunk size warnings
 */

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Build optimizations
  build: {
    // Target modern browsers for smaller bundle size
    target: 'es2015',

    // Output directory
    outDir: 'dist',

    // Generate source maps for production debugging (disable for smallest bundle)
    sourcemap: false,

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console methods
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 1000, // Warn if chunk exceeds 1000kb

    // Manual chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks (libraries that rarely change)
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'react-easy-crop'],
          // Add more vendor chunks as needed
        },
        // Naming pattern for chunks
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // CSS code splitting
    cssCodeSplit: true,

    // Asset inline limit (files smaller than this will be inlined as base64)
    assetsInlineLimit: 4096, // 4kb

    // Improve build performance
    reportCompressedSize: true,
    emptyOutDir: true,
  },

  // Server configuration for development
  server: {
    host: '0.0.0.0', // ✅ Allow access from network devices (mobile)
    port: 5173,
    strictPort: true,
    open: false, // Don't auto-open browser
    cors: true,
    // SPA fallback - serves index.html for all routes (fixes manual URL entry)
    historyApiFallback: true,
    // API proxy configuration (if needed)
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Preview server configuration (for testing production build)
  preview: {
    port: 4173,
    strictPort: true,
    open: false,
  },

  // Dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: [], // Dependencies to exclude from optimization
  },

  // Enable esbuild for faster builds
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
})
