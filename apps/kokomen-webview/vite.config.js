import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigpaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    tsconfigpaths({
      root: ".",
    }),
    react(),
  ],

  server: {
    port: 3000,
    host: "127.0.0.1",
    allowedHosts: ["local.kokomen.kr"],
  },
});
