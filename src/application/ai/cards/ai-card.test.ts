import { describe, expect, it } from "vitest";

import { isAiCard, isToolFailure, toolFailure } from "./ai-card";

describe("isAiCard", () => {
  it("accepts a known card discriminant", () => {
    expect(isAiCard({ type: "compare-regions", tahun: 2024, rows: [] })).toBe(
      true,
    );
  });

  it("rejects unknown or non-object inputs", () => {
    expect(isAiCard({ type: "nope" })).toBe(false);
    expect(isAiCard(null)).toBe(false);
    expect(isAiCard("compare-regions")).toBe(false);
  });
});

describe("toolFailure / isToolFailure", () => {
  it("constructs and narrows a failure", () => {
    const failure = toolFailure("no_data", "kosong");
    expect(isToolFailure(failure)).toBe(true);
    expect(failure.reason).toBe("no_data");
  });
});
