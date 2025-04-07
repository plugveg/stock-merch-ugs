import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "convex/functions/**/*.{test,spec}.{ts,tsx}",
    ],
    coverage: {
      reporter: ["text", "json", "html"],
      include: ["src/**", "convex/functions/**"],
    },
  },
});
