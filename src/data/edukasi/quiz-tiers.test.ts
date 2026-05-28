import { describe, expect, it } from "vitest";

import { QUIZ_TOTAL } from "./quiz-questions";
import { QUIZ_TIERS, resolveQuizTier } from "./quiz-tiers";

describe("resolveQuizTier", () => {
  it("returns 'pemula' for low scores", () => {
    expect(resolveQuizTier(0)?.id).toBe("pemula");
    expect(resolveQuizTier(4)?.id).toBe("pemula");
  });

  it("returns 'pembelajar' for mid scores", () => {
    expect(resolveQuizTier(5)?.id).toBe("pembelajar");
    expect(resolveQuizTier(7)?.id).toBe("pembelajar");
  });

  it("returns 'pejuang' for top scores", () => {
    expect(resolveQuizTier(8)?.id).toBe("pejuang");
    expect(resolveQuizTier(QUIZ_TOTAL)?.id).toBe("pejuang");
  });

  it("returns null for out-of-range scores so the caller can flag the bug", () => {
    expect(resolveQuizTier(-1)).toBeNull();
    expect(resolveQuizTier(QUIZ_TOTAL + 1)).toBeNull();
  });

  it("covers every possible correct-count from 0 to total", () => {
    for (let n = 0; n <= QUIZ_TOTAL; n += 1) {
      expect(resolveQuizTier(n)).not.toBeNull();
    }
  });

  it("uses non-overlapping tier ranges", () => {
    for (let n = 0; n <= QUIZ_TOTAL; n += 1) {
      const matches = QUIZ_TIERS.filter(
        (tier) => n >= tier.min && n <= tier.max,
      );
      expect(matches).toHaveLength(1);
    }
  });
});
