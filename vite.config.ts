/// <reference types="vitest/config" />

import tailwindcss from "@tailwindcss/vite";
import tanstackRouter from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      // siehe Build-ausgabe:
      //  ohne code-splitting: Warnung, großes Bundle
      //  mit Code-Splitting: keine Warnung, viele kleine Bundles
      // autoCodeSplitting: true,
    }),
    tailwindcss(),
    react(),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/images": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["src/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
        },
      },
    ],
  },
});
