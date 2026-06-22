/**
 * Rate-limit configuration for the AI chat endpoint. Numbers live here (not in
 * the gate) so limits are tuned in one place with no magic numbers in code.
 * Anonymous visitors get a much smaller budget than authenticated users; once
 * anon is exhausted the UI prompts a sign-in.
 */

/**
 * A sliding-window duration string. Structurally identical to the
 * `Duration` type from `@upstash/ratelimit`, declared locally so this config
 * carries no runtime dependency on the Upstash package.
 */
export type RateWindow =
  | `${number} ms`
  | `${number} s`
  | `${number} m`
  | `${number} h`
  | `${number} d`;

export type RateLimitTier = "anon" | "auth";

export interface RateLimitRule {
  /** Requests allowed within the window. */
  readonly tokens: number;
  /** Sliding-window length. */
  readonly window: RateWindow;
}

/** Per-tier limits. Anon is intentionally small to cap cost on public pages. */
export const RATE_LIMIT: Record<RateLimitTier, RateLimitRule> = {
  anon: { tokens: 5, window: "3 h" },
  auth: { tokens: 40, window: "3 h" },
};

/** Redis key namespaces. Disjoint so signing in does not inherit the anon counter. */
export const RATE_LIMIT_PREFIX: Record<RateLimitTier, string> = {
  anon: "ai:anon",
  auth: "ai:auth",
};

/** Bucket used when an anonymous caller has no resolvable IP (fail closed). */
export const RATE_LIMIT_UNKNOWN_IP = "unknown";
