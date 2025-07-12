import tailwindcss from "@tailwindcss/vite";
import tanstackRouter from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tanstackRouter(), tailwindcss(), react()],
  server: {
    proxy: {
      "/images": {
        target: "http://localhost:8080",
        changeOrigin: true,
        // Optional: Pfad muss nicht umgeschrieben werden, da "/images" erhalten bleibt
        // Falls du z.B. "/backend/images" im Ziel brauchst:
        // rewrite: path => path.replace(/^\/images/, '/backend/images')
      },
    },
  },
});
