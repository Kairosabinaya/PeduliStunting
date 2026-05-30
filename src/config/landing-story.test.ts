import { describe, expect, it } from "vitest";

import {
  CHILDREN_AFFECTED_TOTAL,
  CHOROPLETH_TIER_ORDER,
  CONNECTIVE_BEATS,
} from "@/config/landing-story";
import { EDUKASI_FOOTNOTE_INDEX } from "@/data/edukasi/footnotes";

describe("landing-story config", () => {
  it("pins the children-affected total to the cited SSGI 2024 figure", () => {
    // 19,8% prevalence = 4.482.340 balita (fn-prevalence). Counting up to any
    // other number would misrepresent the source.
    expect(CHILDREN_AFFECTED_TOTAL).toBe(4_482_340);
  });

  it("reveals the choropleth low → high severity", () => {
    expect(CHOROPLETH_TIER_ORDER).toEqual(["Rendah", "Sedang", "Tinggi"]);
  });

  describe("connective beats", () => {
    const beats = Object.values(CONNECTIVE_BEATS);

    it("every cited footnote id resolves to a real footnote", () => {
      for (const beat of beats) {
        for (const id of beat.footnoteIds) {
          expect(EDUKASI_FOOTNOTE_INDEX[id]).toBeDefined();
        }
      }
    });

    it("every beat's highlight word appears in one of its lines", () => {
      for (const beat of beats) {
        expect(beat.lines.some((line) => line.includes(beat.highlight))).toBe(
          true,
        );
      }
    });

    it("uses only known panel tones", () => {
      const allowed = new Set(["paper", "pine", "terracotta"]);
      for (const beat of beats) {
        expect(allowed.has(beat.tone)).toBe(true);
      }
    });
  });
});
