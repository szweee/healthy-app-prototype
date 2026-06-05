import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  // GitHub Pages 部署在 /healthy-app-prototype/ 子路径下;本地开发仍用根路径
  base: command === "build" ? "/healthy-app-prototype/" : "/",
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
}));
