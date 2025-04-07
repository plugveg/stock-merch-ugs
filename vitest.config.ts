import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "convex/_generated/**",
        "commitlint.config.cjs",
        "postcss.config.js",
        "tailwind.config.js",
      ],
    },
  },
});
