import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigpaths from "vite-tsconfig-paths";
import { readFileSync } from "fs";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true
    }),
    tailwindcss(),
    tsconfigpaths({
      root: "."
    }),
    react()
  ],

  server: {
    port: 3000,
    host: "127.0.0.1",
    allowedHosts: ["local.kokomen.kr"],
    https: {
      key: readFileSync("./local.kokomen.kr+2-key.pem"),
      cert: readFileSync("./local.kokomen.kr+2.pem")
    }
  },
  assetsInclude: ["**/*.glb"],
  resolve: {
    alias: {
      "@components": path.resolve(
        __dirname,
        "../../packages/ui/src/components"
      ),
      "@assets": path.resolve(__dirname, "../../packages/ui/src/assets")
    }
  }
});
