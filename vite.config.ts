import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { sentryReactRouter, type SentryReactRouterBuildOptions } from '@sentry/react-router';
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";


const sentryConfig: SentryReactRouterBuildOptions = {
  org: "lemore",
  project: "lemore",
  // An auth token is required for uploading source maps;
  // store it in an environment variable to keep it secure.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // ...
};

export default defineConfig((config) => ({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), sentryReactRouter(sentryConfig, config)],
  build: {
    // PHASE 4: Compression and optimization settings
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: true,
    rollupOptions: {
      external: [
        "postgres",
        "drizzle-orm/node-postgres"
      ],
      output: {
        // PHASE 4: Advanced code splitting for better caching (React Router 7 compatible)
        manualChunks: (id) => {
          // Vendor chunks for external dependencies
          if (id.includes('lucide-react') || id.includes('framer-motion')) {
            return 'vendor-ui';
          }
          if (id.includes('@supabase/supabase-js')) {
            return 'vendor-supabase';
          }
          if (id.includes('luxon') || id.includes('zod')) {
            return 'vendor-utils';
          }
          
          // Feature-based chunks
          if (id.includes('/features/auth/')) {
            return 'features-auth';
          }
          if (id.includes('/features/products/')) {
            return 'features-products';
          }
          if (id.includes('/features/users/')) {
            return 'features-users';
          }
          
          // Large node_modules as separate chunks
          if (id.includes('node_modules')) {
            // Split large dependencies into their own chunks
            if (id.includes('date-fns')) return 'vendor-date';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            if (id.includes('tailwindcss')) return 'vendor-tailwind';
            
            // Group smaller dependencies together
            return 'vendor';
          }
        },
        // Optimize chunk naming for better caching
        chunkFileNames: '[name]-[hash].js'
      }
    }
  },
  server: {
    host: "localhost",
    port: 5173,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
    ],
  },
}));
