/**
 * Upstash implementation of {@link RateLimiterPort}. The ONLY file importing
 * `@upstash/*`. Builds one sliding-window limiter per tier from config. When
 * Upstash env vars are absent (dev/test) {@link getRateLimiter} returns a
 * permissive no-op and logs a single warning, so local development needs no
 * Upstash account (mirrors `hasSupabaseConfig()`).
 */

import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import type {
  RateLimitDecision,
  RateLimiterPort,
} from "@/application/ai/ports/rate-limiter-port";
import { env, hasUpstashConfig } from "@/config/env";
import {
  RATE_LIMIT,
  RATE_LIMIT_PREFIX,
  type RateLimitTier,
} from "@/config/rate-limit";
import type { Logger } from "@/domain/shared/logger";

class UpstashRateLimiter implements RateLimiterPort {
  private readonly limiters: Record<RateLimitTier, Ratelimit>;

  constructor(redis: Redis) {
    this.limiters = {
      anon: new Ratelimit({
        redis,
        prefix: RATE_LIMIT_PREFIX.anon,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT.anon.tokens,
          RATE_LIMIT.anon.window,
        ),
      }),
      auth: new Ratelimit({
        redis,
        prefix: RATE_LIMIT_PREFIX.auth,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT.auth.tokens,
          RATE_LIMIT.auth.window,
        ),
      }),
    };
  }

  async check(key: string, tier: RateLimitTier): Promise<RateLimitDecision> {
    const result = await this.limiters[tier].limit(key);
    const retryAfterSeconds = Math.max(
      0,
      Math.ceil((result.reset - Date.now()) / 1000),
    );
    return {
      allowed: result.success,
      remaining: result.remaining,
      retryAfterSeconds,
    };
  }
}

class NoopRateLimiter implements RateLimiterPort {
  async check(): Promise<RateLimitDecision> {
    return {
      allowed: true,
      remaining: Number.MAX_SAFE_INTEGER,
      retryAfterSeconds: 0,
    };
  }
}

let cached: RateLimiterPort | undefined;

/** Return the process-wide rate limiter (Upstash, or a dev no-op when unset). */
export function getRateLimiter(logger: Logger): RateLimiterPort {
  if (cached) return cached;
  if (
    !hasUpstashConfig() ||
    !env.UPSTASH_REDIS_REST_URL ||
    !env.UPSTASH_REDIS_REST_TOKEN
  ) {
    logger.warn(
      "Upstash not configured; AI rate limiting disabled (development no-op).",
    );
    cached = new NoopRateLimiter();
    return cached;
  }
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  cached = new UpstashRateLimiter(redis);
  return cached;
}
