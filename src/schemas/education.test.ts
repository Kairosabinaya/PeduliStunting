import { describe, expect, it } from "vitest";

import {
  articleAgeRangeSchema,
  articleListFilterSchema,
  articleTopicSchema,
  mapEducationArticleRow,
  slugSchema,
} from "./education";

describe("education schemas", () => {
  describe("slugSchema", () => {
    it.each([
      "mpasi-pertama-6-bulan",
      "asi-eksklusif",
      "tanda-bahaya-kehamilan",
      "a1",
    ])("accepts %s", (input) => {
      const result = slugSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it.each([
      "",
      "Has Uppercase",
      "with space",
      "trailing-",
      "-leading",
      "double--dash",
      "non/alphanum",
      "with_underscore",
    ])("rejects %s", (input) => {
      const result = slugSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("brands the parsed value", () => {
      const result = slugSchema.parse("a-valid-slug");
      // brand exists at type level only; runtime value is unchanged
      expect(result).toBe("a-valid-slug");
    });
  });

  describe("articleTopicSchema", () => {
    it("accepts every catalogued topic", () => {
      for (const topic of [
        "kehamilan",
        "persalinan",
        "nifas",
        "bayi",
        "balita",
        "gizi",
        "imunisasi",
        "perkembangan",
        "kesehatan_umum",
      ]) {
        expect(articleTopicSchema.safeParse(topic).success).toBe(true);
      }
    });

    it("rejects unknown topics", () => {
      expect(articleTopicSchema.safeParse("nutrisi").success).toBe(false);
      expect(articleTopicSchema.safeParse("").success).toBe(false);
    });
  });

  describe("articleAgeRangeSchema", () => {
    it("accepts the prenatal kind with no extra fields", () => {
      const result = articleAgeRangeSchema.safeParse({ kind: "prenatal" });
      expect(result.success).toBe(true);
    });

    it("accepts a valid child range", () => {
      const result = articleAgeRangeSchema.safeParse({
        kind: "child",
        minAgeMonths: 0,
        maxAgeMonths: 6,
      });
      expect(result.success).toBe(true);
    });

    it("rejects a child range with min > max", () => {
      const result = articleAgeRangeSchema.safeParse({
        kind: "child",
        minAgeMonths: 24,
        maxAgeMonths: 6,
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative ages", () => {
      const result = articleAgeRangeSchema.safeParse({
        kind: "child",
        minAgeMonths: -1,
        maxAgeMonths: 6,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("articleListFilterSchema", () => {
    it("accepts an empty filter", () => {
      expect(articleListFilterSchema.safeParse({}).success).toBe(true);
    });

    it("accepts a fully-specified filter", () => {
      const result = articleListFilterSchema.safeParse({
        topic: "gizi",
        ageRange: { kind: "child", minAgeMonths: 0, maxAgeMonths: 6 },
        search: "ASI",
        limit: 12,
        offset: 0,
      });
      expect(result.success).toBe(true);
    });

    it("rejects an over-long search term", () => {
      const result = articleListFilterSchema.safeParse({
        search: "a".repeat(81),
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative offsets and oversized limits", () => {
      expect(
        articleListFilterSchema.safeParse({ offset: -1 }).success,
      ).toBe(false);
      expect(
        articleListFilterSchema.safeParse({ limit: 0 }).success,
      ).toBe(false);
      expect(
        articleListFilterSchema.safeParse({ limit: 999 }).success,
      ).toBe(false);
    });

    it("rejects unknown fields (strict)", () => {
      const result = articleListFilterSchema.safeParse({
        topic: "gizi",
        sortBy: "title",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("mapEducationArticleRow", () => {
    const baseRow = {
      id: "11111111-1111-4111-8111-111111111111",
      slug: "tanda-bahaya-kehamilan",
      title: "Tanda Bahaya Kehamilan",
      topic: "kehamilan",
      min_age_months: null,
      max_age_months: null,
      summary: "Daftar tanda bahaya selama kehamilan.",
      body_md: "# Tanda bahaya",
      source_label: "Buku KIA 2024 hal. 11",
      source_url: "https://kesmas.kemkes.go.id/konten/133/0/buku-kia",
      published_at: "2026-05-12T00:00:00.000Z",
      created_at: "2026-05-01T00:00:00.000Z",
      updated_at: "2026-05-01T00:00:00.000Z",
    } as const;

    it("maps a valid row to an EducationArticle entity", () => {
      const result = mapEducationArticleRow({ ...baseRow });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.slug).toBe("tanda-bahaya-kehamilan");
      expect(result.value.topic).toBe("kehamilan");
      expect(result.value.minAgeMonths).toBeNull();
      expect(result.value.publishedAt).toBeInstanceOf(Date);
    });

    it("preserves child age bounds", () => {
      const result = mapEducationArticleRow({
        ...baseRow,
        topic: "gizi",
        min_age_months: 6,
        max_age_months: 8,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.minAgeMonths).toBe(6);
      expect(result.value.maxAgeMonths).toBe(8);
    });

    it("returns a validation error for an unknown topic", () => {
      const result = mapEducationArticleRow({
        ...baseRow,
        topic: "nutrisi" as never,
      });
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.kind).toBe("validation");
    });

    it("represents an unpublished article (published_at null) by setting publishedAt to null", () => {
      const result = mapEducationArticleRow({
        ...baseRow,
        published_at: null,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.publishedAt).toBeNull();
    });
  });
});
