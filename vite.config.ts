import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitePluginInjectDataLocator from "./plugins/vite-plugin-inject-data-locator";
import path from "path"; // <-- ✅ IMPORTANTE
import fs from "fs"; // <-- Agrega esta línea para leer los certificados

export default defineConfig(({ command }) => {
  let httpsConfig;

  // Solo intentar cargar certificados en modo desarrollo (serve)
  if (command === 'serve') {
    try {
      const keyPath = "cert/key.pem";
      const certPath = "cert/cert.pem";

      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        httpsConfig = {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        };
      }
    } catch (e) {
      console.warn("Certificados SSL no encontrados, iniciando servidor sin HTTPS");
    }
  }

  return {
    plugins: [react(), vitePluginInjectDataLocator()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      https: httpsConfig,
      proxy: {
        "/api": "http://localhost:3001",
      },
    },
  };
});
