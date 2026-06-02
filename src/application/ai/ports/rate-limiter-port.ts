/**
 * Port for the rate-limit decision. The route/service depends on this, not on
 * Upstash. The concrete adapter lives in the infrastructure layer.
 */

import type { RateLimitTier } from "@/config/rate-limit";

export interface RateLimitDecision {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly retryAfterSeconds: number;
}

export interface RateLimiterPort {
  /**
   * Consume one token for `key` under the given `tier`. Returns whether the
   * request is allowed plus the seconds until the window refills.
   */
  check(key: string, tier: RateLimitTier): Promise<RateLimitDecision>;
}
