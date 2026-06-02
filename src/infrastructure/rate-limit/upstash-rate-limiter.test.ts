import { describe, expect, it } from "vitest";

import { fakeLogger } from "../../../tests/factories/ai";
import { getRateLimiter } from "./upstash-rate-limiter";

describe("getRateLimiter", () => {
  it("returns a permissive no-op when Upstash is unconfigured", async () => {
    const limiter = getRateLimiter(fakeLogger());
    const decision = await limiter.check("some-key", "anon");
    expect(decision.allowed).toBe(true);
    expect(decision.retryAfterSeconds).toBe(0);
  });
});
