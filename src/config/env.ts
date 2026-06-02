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
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

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

  // --- Gemini AI (server-only secrets; never exposed to the browser) ---
  // The browser never talks to Gemini directly; the `/api/ai/chat` Route
  // Handler is the only caller. Swapping the dev free-tier key for a paid
  // (no-training) key is a single env change here, no code change. See ADR-0020.
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).default("gemini-2.5-flash-lite"),
  GEMINI_MAX_OUTPUT_TOKENS: z.coerce
    .number()
    .int()
    .positive()
    .max(8192)
    .default(1024),
  // ADR-0021: explicit acknowledgement that on the free tier Google may train on
  // the tracker payload. Flip to "false" when moving to a paid no-training key.
  GEMINI_TRACKER_DATA_TRAINING_RISK_ACCEPTED: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),

  // --- Upstash Redis (rate limiting; server-only) ---
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
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
    GEMINI_API_KEY: emptyToUndefined(process.env.GEMINI_API_KEY),
    GEMINI_MODEL: emptyToUndefined(process.env.GEMINI_MODEL),
    GEMINI_MAX_OUTPUT_TOKENS: emptyToUndefined(
      process.env.GEMINI_MAX_OUTPUT_TOKENS,
    ),
    GEMINI_TRACKER_DATA_TRAINING_RISK_ACCEPTED: emptyToUndefined(
      process.env.GEMINI_TRACKER_DATA_TRAINING_RISK_ACCEPTED,
    ),
    UPSTASH_REDIS_REST_URL: emptyToUndefined(
      process.env.UPSTASH_REDIS_REST_URL,
    ),
    UPSTASH_REDIS_REST_TOKEN: emptyToUndefined(
      process.env.UPSTASH_REDIS_REST_TOKEN,
    ),
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

/**
 * Returns true when a Gemini API key is configured. The AI chat endpoint fails
 * cleanly (502 external_service) when this is false, so the feature degrades
 * gracefully on a deploy that has not yet been given a key.
 */
export function hasGeminiConfig(): boolean {
  return Boolean(env.GEMINI_API_KEY);
}

/**
 * Returns true when Upstash Redis credentials are present. When false, the rate
 * limiter falls back to a permissive no-op (dev/test) and logs a warning, so
 * local development does not require an Upstash account.
 */
export function hasUpstashConfig(): boolean {
  return Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
}
