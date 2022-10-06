import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/habassistant/",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/habassistant/ws": {
        target: "ws://localhost:8080",
        ws: true,
      },
      "/rest": {
        target: "http://localhost:8080",
      },
    },
  },
});
