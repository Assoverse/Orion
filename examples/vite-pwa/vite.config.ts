import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: "autoUpdate",
    includeAssets: ["favicon.svg"],
    manifest: {
      name: "Orion Vite PWA",
      short_name: "OrionPWA",
      start_url: "/",
      display: "standalone",
      theme_color: "#0F172A",
      background_color: "#0F172A",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    }
  })],
  server: {
    port: 4174,
  },
});
