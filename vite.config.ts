import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitePluginInjectDataLocator from "./plugins/vite-plugin-inject-data-locator";

export default defineConfig({
  plugins: [react(), vitePluginInjectDataLocator()],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
