import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    css: false,
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "tests/unit/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["node_modules", ".next", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: [
        "node_modules/",
        ".next/",
        "coverage/",
        "tests/",
        "**/*.config.*",
        "**/*.d.ts",
        "src/app/**/{layout,page,loading,error,not-found,template,default}.tsx",
        "src/types/**",
      ],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // `server-only` throws outside an RSC bundle; treat it as a no-op so
      // server-only modules (e.g. the choropleth data loader) are unit-testable.
      "server-only": path.resolve(
        __dirname,
        "./tests/setup/server-only-stub.ts",
      ),
    },
  },
});
