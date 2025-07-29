import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigpaths from "vite-tsconfig-paths";
import path from "path";

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
  test: {
    exclude: [...configDefaults.exclude],
    environment: "jsdom",
    setupFiles: ["./test-setup.ts"],
    globals: true,
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test-setup.ts",
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**"
      ]
    }
  },
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
