import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
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
      "84d5b8aeeed2.ngrok-free.app",
      ".ngrok-free.app", // 모든 ngrok 도메인 허용
    ],
  },
});
