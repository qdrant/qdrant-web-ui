/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__test__/setup/global.ts"],
    testTimeout: 5000,
    includeSource: ["src/**/*.{js,ts,tsx,jsx}"],

    // reporters: ['json' ],
    logHeapUsage: true,
    benchmark: {
      outputFile: "./bench.json",
      reporters: ["json", "default"],
    },
  },
  define: {
    "import.meta.vitest": true,
  },
});
