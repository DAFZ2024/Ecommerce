import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitePluginInjectDataLocator from "./plugins/vite-plugin-inject-data-locator";
import path from "path"; // <-- ✅ IMPORTANTE
import fs from "fs"; // <-- Agrega esta línea para leer los certificados

export default defineConfig({
  plugins: [react(), vitePluginInjectDataLocator()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // <-- ✅ ALIAS DEFINIDO AQUÍ
    },
  },
  server: {
    https: {
      key: fs.readFileSync("cert/key.pem"),
      cert: fs.readFileSync("cert/cert.pem"),
    },
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
