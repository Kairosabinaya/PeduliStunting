import { describe, expect, it } from "vitest";

import {
  ARTICLE_TOPICS,
  type ArticleTopic,
} from "@/domain/education/value-objects/article-topic";

import {
  EDUCATION_AGE_PARAM,
  EDUCATION_AGE_PRESETS,
  EDUCATION_AGE_PRESET_INDEX,
  EDUCATION_COPY,
  EDUCATION_DETAIL_COPY,
  EDUCATION_DETAIL_REVALIDATE_SECONDS,
  EDUCATION_LIST_CACHE_TAG,
  EDUCATION_LIST_REVALIDATE_SECONDS,
  EDUCATION_PAGE_PARAM,
  EDUCATION_PAGE_SIZE,
  EDUCATION_SEARCH_MAX_LENGTH,
  EDUCATION_SEARCH_MIN_LENGTH,
  EDUCATION_SEARCH_PARAM,
  EDUCATION_TOPIC_CATALOG,
  EDUCATION_TOPIC_INDEX,
  EDUCATION_TOPIC_PARAM,
  educationArticleCacheTag,
  formatEducationAgeRange,
  formatEducationAudienceLabel,
  isEducationAgePresetKey,
  isEducationTopicKey,
} from "./education";

describe("education config", () => {
  describe("URL search params", () => {
    it("uses stable, Indonesian search-param keys", () => {
      expect(EDUCATION_TOPIC_PARAM).toBe("topik");
      expect(EDUCATION_AGE_PARAM).toBe("usia");
      expect(EDUCATION_SEARCH_PARAM).toBe("cari");
      expect(EDUCATION_PAGE_PARAM).toBe("halaman");
    });
  });

  describe("list configuration", () => {
    it("uses a page size compatible with grid layouts", () => {
      expect(EDUCATION_PAGE_SIZE).toBeGreaterThan(0);
      expect(EDUCATION_PAGE_SIZE % 3).toBe(0);
    });

    it("enforces sensible search bounds", () => {
      expect(EDUCATION_SEARCH_MIN_LENGTH).toBeGreaterThanOrEqual(2);
      expect(EDUCATION_SEARCH_MAX_LENGTH).toBeGreaterThan(
        EDUCATION_SEARCH_MIN_LENGTH,
      );
    });

    it("matches STATE.md revalidation windows", () => {
      expect(EDUCATION_LIST_REVALIDATE_SECONDS).toBe(1800);
      expect(EDUCATION_DETAIL_REVALIDATE_SECONDS).toBe(86_400);
    });

    it("namespaces article cache tags by slug", () => {
      expect(EDUCATION_LIST_CACHE_TAG).toBe("articles");
      expect(educationArticleCacheTag("merawat-bayi-baru-lahir")).toBe(
        "article:merawat-bayi-baru-lahir",
      );
    });
  });

  describe("topic catalogue", () => {
    it("covers every domain topic exactly once", () => {
      const catalogKeys = EDUCATION_TOPIC_CATALOG.map((entry) => entry.key);
      expect(catalogKeys).toHaveLength(ARTICLE_TOPICS.length);
      expect(new Set(catalogKeys).size).toBe(ARTICLE_TOPICS.length);
      for (const topic of ARTICLE_TOPICS) {
        expect(catalogKeys).toContain(topic);
      }
    });

    it("provides a label, description, and approved tone for each entry", () => {
      const allowedTones = new Set(["neutral", "primary", "success"]);
      for (const entry of EDUCATION_TOPIC_CATALOG) {
        expect(entry.label.length).toBeGreaterThan(0);
        expect(entry.description.length).toBeGreaterThan(0);
        expect(allowedTones.has(entry.tone)).toBe(true);
      }
    });

    it("exposes a complete lookup index", () => {
      for (const topic of ARTICLE_TOPICS) {
        const indexed = EDUCATION_TOPIC_INDEX[topic as ArticleTopic];
        expect(indexed).toBeDefined();
        expect(indexed.key).toBe(topic);
      }
    });

    it("type-narrows topic keys via isEducationTopicKey", () => {
      expect(isEducationTopicKey("gizi")).toBe(true);
      expect(isEducationTopicKey("not-a-topic")).toBe(false);
    });
  });

  describe("age presets", () => {
    it("offers prenatal plus four child age bands", () => {
      const kinds = EDUCATION_AGE_PRESETS.map((preset) => preset.range.kind);
      expect(kinds.filter((kind) => kind === "prenatal")).toHaveLength(1);
      expect(kinds.filter((kind) => kind === "child")).toHaveLength(4);
    });

    it("declares child ranges with min < max", () => {
      for (const preset of EDUCATION_AGE_PRESETS) {
        if (preset.range.kind === "child") {
          expect(preset.range.minAgeMonths).toBeLessThan(
            preset.range.maxAgeMonths,
          );
          expect(preset.range.minAgeMonths).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it("exposes unique URL keys via the lookup index", () => {
      const keys = EDUCATION_AGE_PRESETS.map((preset) => preset.key);
      expect(new Set(keys).size).toBe(keys.length);
      for (const preset of EDUCATION_AGE_PRESETS) {
        expect(EDUCATION_AGE_PRESET_INDEX[preset.key]).toEqual(preset);
      }
    });

    it("type-narrows preset keys via isEducationAgePresetKey", () => {
      expect(isEducationAgePresetKey("0-6")).toBe(true);
      expect(isEducationAgePresetKey("prakelahiran")).toBe(true);
      expect(isEducationAgePresetKey("not-a-preset")).toBe(false);
    });
  });

  describe("formatEducationAgeRange", () => {
    it("returns null when both bounds are null (prenatal)", () => {
      expect(formatEducationAgeRange(null, null)).toBeNull();
    });

    it("renders an inclusive range when both bounds are set", () => {
      expect(formatEducationAgeRange(6, 12)).toBe("6-12 bln");
    });

    it("renders an open lower bound when only min is set", () => {
      expect(formatEducationAgeRange(24, null)).toBe("\u2265 24 bln");
    });

    it("renders an open upper bound when only max is set", () => {
      expect(formatEducationAgeRange(null, 6)).toBe("\u2264 6 bln");
    });
  });

  describe("formatEducationAudienceLabel", () => {
    it("labels prenatal articles", () => {
      expect(formatEducationAudienceLabel(null, null)).toBe("Prakelahiran");
    });

    it("delegates to the range formatter for child articles", () => {
      expect(formatEducationAudienceLabel(0, 6)).toBe("0-6 bln");
    });
  });

  describe("copy", () => {
    it("provides Indonesian copy for every page surface", () => {
      expect(EDUCATION_COPY.eyebrow.length).toBeGreaterThan(0);
      expect(EDUCATION_COPY.title.length).toBeGreaterThan(0);
      expect(EDUCATION_COPY.description.length).toBeGreaterThan(0);
      expect(EDUCATION_COPY.searchPlaceholder.length).toBeGreaterThan(0);
      expect(EDUCATION_COPY.emptyTitle.length).toBeGreaterThan(0);
      expect(EDUCATION_COPY.errorTitle.length).toBeGreaterThan(0);
    });

    it("pluralises the result summary", () => {
      expect(EDUCATION_COPY.resultsSummary(0)).toContain("0");
      expect(EDUCATION_COPY.resultsSummary(1)).toBe("1 artikel ditemukan");
      expect(EDUCATION_COPY.resultsSummary(42)).toBe("42 artikel ditemukan");
    });

    it("renders pagination status for any page count", () => {
      expect(EDUCATION_COPY.paginationStatus(1, 3)).toBe("Halaman 1 dari 3");
    });

    it("exposes detail-page back link copy", () => {
      expect(EDUCATION_DETAIL_COPY.backLink.length).toBeGreaterThan(0);
      expect(EDUCATION_DETAIL_COPY.notFoundTitle.length).toBeGreaterThan(0);
    });
  });
});
