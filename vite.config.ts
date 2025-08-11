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
        // PHASE 4: Safe manual chunking - only for non-external libraries
        chunkFileNames: '[name]-[hash].js',
        manualChunks: {
          // Only chunk non-external modules
          'router-vendor': ['react-router'],
          'ui-vendor': ['@radix-ui/react-slot', '@radix-ui/react-separator'],
          'supabase-vendor': ['@supabase/supabase-js']
        }
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
