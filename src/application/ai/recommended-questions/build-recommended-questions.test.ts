import { describe, expect, it } from "vitest";

import { buildRecommendedQuestions } from "./build-recommended-questions";

describe("buildRecommendedQuestions", () => {
  describe("without a selection", () => {
    it("drops selection-only templates and leaves no placeholders", () => {
      const questions = buildRecommendedQuestions("map", {
        hasSelection: false,
      });
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.every((q) => !q.includes("{"))).toBe(true);
      expect(questions.some((q) => q.toLowerCase().includes("tertinggi"))).toBe(
        true,
      );
    });

    it("keeps the generic tracker starter", () => {
      const questions = buildRecommendedQuestions("tracker", {
        hasSelection: false,
      });
      expect(questions.some((q) => q.toLowerCase().includes("stunting"))).toBe(
        true,
      );
    });
  });

  describe("with a selection", () => {
    it("interpolates the region name and year", () => {
      const questions = buildRecommendedQuestions("map", {
        hasSelection: true,
        selectionLabel: "Kota Surabaya",
        tahun: 2024,
      });
      expect(questions.some((q) => q.includes("Kota Surabaya"))).toBe(true);
      expect(questions.some((q) => q.includes("2024"))).toBe(true);
    });

    it("uses a fallback label when none is given", () => {
      const questions = buildRecommendedQuestions("data", {
        hasSelection: true,
      });
      expect(questions.some((q) => q.includes("wilayah ini"))).toBe(true);
    });
  });
});
