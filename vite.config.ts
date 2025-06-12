import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitePluginInjectDataLocator from "./plugins/vite-plugin-inject-data-locator";
import path from "path"; // <-- ✅ IMPORTANTE

export default defineConfig({
  plugins: [react(), vitePluginInjectDataLocator()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // <-- ✅ ALIAS DEFINIDO AQUÍ
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
