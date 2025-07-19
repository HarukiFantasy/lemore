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
    rollupOptions: {
      external: [
        "postgres",
        "drizzle-orm/node-postgres"
      ]
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
