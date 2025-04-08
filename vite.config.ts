import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { codecovVitePlugin } from "@codecov/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "stock-merch-ugs",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
