import { defineConfig } from "vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { readFileSync } from "fs";
import browserslistToEsbuild from 'browserslist-to-esbuild'
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigpaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig(({ command }) => {
  const isDev = command === "serve";

  return {
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
    optimizeDeps: {
      include: ["@kokomen/ui"]
    },
    ...(isDev && {
      server: {
        port: 3000,
        host: "127.0.0.1",
        allowedHosts: ["local.kokomen.kr"],
        https: {
          key: readFileSync("./local.kokomen.kr+2-key.pem"),
          cert: readFileSync("./local.kokomen.kr+2.pem")
        }
      }
    }),
    build: {
      target: browserslistToEsbuild()
    },
    assetsInclude: ["**/*.glb"],
    resolve: {
      alias: {
        "@assets": path.resolve(__dirname, "../../packages/ui/src/assets")
      }
    }
  };
});
