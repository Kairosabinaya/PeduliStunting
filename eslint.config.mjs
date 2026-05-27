import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
      "*.config.{js,mjs,cjs}",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "process",
              message:
                "Access env vars via `@/config/env` instead of process directly.",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.name='process'][property.name='env']",
          message:
            "Do not read process.env outside src/config/env.ts. Import from @/config/env.",
        },
      ],
    },
  },
  {
    files: ["src/config/env.ts"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      "no-console": "error",
    },
  },
  {
    files: [
      "scripts/**/*.{ts,mts,cts}",
      "tests/**/*.{ts,tsx}",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "vitest.config.ts",
      "playwright.config.ts",
      "sentry.*.config.ts",
      "src/instrumentation.ts",
    ],
    rules: {
      "no-console": "off",
      "no-restricted-syntax": "off",
    },
  },
];

export default config;
