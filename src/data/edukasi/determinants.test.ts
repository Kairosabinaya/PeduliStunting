import { describe, expect, it } from "vitest";

import {
  DETERMINANT_LAYERS,
  INCOME_QUINTILES,
  INCOME_QUINTILE_NATIONAL,
} from "./determinants";

describe("DETERMINANT_LAYERS", () => {
  it("contains exactly the five WHO levels", () => {
    expect(DETERMINANT_LAYERS).toHaveLength(5);
    const levels = DETERMINANT_LAYERS.map((l) => l.level).sort();
    expect(levels).toEqual([1, 2, 3, 4, 5]);
  });

  it("has unique ids", () => {
    const ids = DETERMINANT_LAYERS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every layer has non-empty label, description, and evidence body", () => {
    DETERMINANT_LAYERS.forEach((layer) => {
      expect(layer.label.trim().length).toBeGreaterThan(0);
      expect(layer.description.trim().length).toBeGreaterThan(0);
      expect(layer.evidenceBody.trim().length).toBeGreaterThan(0);
    });
  });
});

describe("INCOME_QUINTILES", () => {
  it("contains exactly five quintiles", () => {
    expect(INCOME_QUINTILES).toHaveLength(5);
  });

  it("orders monotonically: Q1 highest, Q5 lowest prevalence", () => {
    for (let i = 0; i < INCOME_QUINTILES.length - 1; i += 1) {
      const current = INCOME_QUINTILES[i];
      const next = INCOME_QUINTILES[i + 1];
      if (!current || !next) throw new Error("unexpected gap");
      expect(current.prevalencePct).toBeGreaterThanOrEqual(next.prevalencePct);
    }
  });

  it("Q1 prevalence is anchored to the SSGI 2024 published number (29.8)", () => {
    expect(INCOME_QUINTILES[0]?.prevalencePct).toBe(29.8);
  });

  it("national average matches the SSGI 2024 headline (19.8)", () => {
    expect(INCOME_QUINTILE_NATIONAL).toBe(19.8);
  });
});
