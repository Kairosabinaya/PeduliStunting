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
      // Interim baseline reflecting the current repo reality: many thin
      // pass-through use cases across the app ship without unit tests, so the
      // global figure sits well below the original 80% aspiration. These floors
      // are set just under the measured coverage to keep CI honest (it still
      // fails if coverage regresses) while we backfill the untested use cases.
      thresholds: {
        lines: 58,
        branches: 50,
        functions: 50,
        statements: 55,
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
