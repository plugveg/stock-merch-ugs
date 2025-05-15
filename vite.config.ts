import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { codecovVitePlugin } from "@codecov/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "StockMerchUGS",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
