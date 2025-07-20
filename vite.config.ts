/// <reference types="vitest/config" />

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const enableCompiler = false;

const babelConfig = enableCompiler
  ? { babel: { plugins: ["babel-plugin-react-compiler", {}] } }
  : undefined;

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(babelConfig)],
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
          environment: "jsdom",
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          include: ["src/**/*.{browsertest,spec}.?(c|m)[jt]s?(x)"],
          browser: {
            enabled: true,
            provider: "playwright",
            // https://vitest.dev/guide/browser/playwright
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
