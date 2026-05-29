import { describe, expect, it } from "vitest";

import { findHeightComparison, findWeightComparison } from "./fun-size";

describe("findWeightComparison", () => {
  it("returns null for null or non-positive values", () => {
    expect(findWeightComparison(null)).toBeNull();
    expect(findWeightComparison(0)).toBeNull();
    expect(findWeightComparison(-5)).toBeNull();
  });

  it("returns the lowest bucket for very small babies", () => {
    const result = findWeightComparison(2);
    expect(result?.fromKg).toBe(0);
  });

  it("returns the matching bucket at the boundary", () => {
    const result = findWeightComparison(7);
    expect(result?.fromKg).toBe(7);
  });

  it("returns the highest bucket below the value", () => {
    const result = findWeightComparison(15);
    expect(result?.fromKg).toBe(13);
  });

  it("returns the topmost bucket for large values", () => {
    const result = findWeightComparison(40);
    expect(result?.fromKg).toBe(22);
  });
});

describe("findHeightComparison", () => {
  it("returns null for null or non-positive values", () => {
    expect(findHeightComparison(null)).toBeNull();
    expect(findHeightComparison(0)).toBeNull();
  });

  it("returns a bucket for in-range values", () => {
    const result = findHeightComparison(75);
    expect(result?.fromCm).toBe(70);
  });

  it("returns the topmost bucket for very tall values", () => {
    const result = findHeightComparison(140);
    expect(result?.fromCm).toBe(110);
  });
});
