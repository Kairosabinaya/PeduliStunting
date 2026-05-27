import { z } from "zod";

/**
 * Single source of truth for environment variables.
 *
 * All other modules MUST import named values from this file rather than reading
 * `process.env` directly. Validation runs once at module load and throws if a
 * required variable is missing or malformed.
 */
const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Peduli Stunting"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
  SENTRY_ORG: z.string().min(1).optional(),
  SENTRY_PROJECT: z.string().min(1).optional(),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  VERCEL_GIT_COMMIT_SHA: z.string().min(1).optional(),
});

export type Env = z.infer<typeof EnvSchema>;

function emptyToUndefined(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return value.trim().length === 0 ? undefined : value;
}

function loadEnv(): Env {
  const parsed = EnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_NAME: emptyToUndefined(process.env.NEXT_PUBLIC_APP_NAME),
    NEXT_PUBLIC_APP_URL: emptyToUndefined(process.env.NEXT_PUBLIC_APP_URL),
    NEXT_PUBLIC_SUPABASE_URL: emptyToUndefined(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: emptyToUndefined(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    SUPABASE_SERVICE_ROLE_KEY: emptyToUndefined(
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
    NEXT_PUBLIC_SENTRY_DSN: emptyToUndefined(
      process.env.NEXT_PUBLIC_SENTRY_DSN,
    ),
    SENTRY_AUTH_TOKEN: emptyToUndefined(process.env.SENTRY_AUTH_TOKEN),
    SENTRY_ORG: emptyToUndefined(process.env.SENTRY_ORG),
    SENTRY_PROJECT: emptyToUndefined(process.env.SENTRY_PROJECT),
    LOG_LEVEL: emptyToUndefined(process.env.LOG_LEVEL),
    VERCEL_GIT_COMMIT_SHA: emptyToUndefined(process.env.VERCEL_GIT_COMMIT_SHA),
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}

export const env: Env = loadEnv();

/**
 * Returns true when Supabase credentials are present. Stage 1 leaves Supabase
 * variables optional so the project builds before backend wiring; later stages
 * make them required at the call site rather than at boot.
 */
export function hasSupabaseConfig(): boolean {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
