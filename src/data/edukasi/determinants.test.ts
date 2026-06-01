import { describe, expect, it } from "vitest";

import { DETERMINANT_LAYERS } from "./determinants";

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
