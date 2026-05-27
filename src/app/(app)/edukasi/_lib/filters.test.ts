import { describe, expect, it } from "vitest";

import {
  EDUCATION_PAGE_SIZE,
  EDUCATION_SEARCH_MIN_LENGTH,
} from "@/config/education";

import {
  buildEdukasiHref,
  hasActiveEdukasiFilters,
  parseEdukasiFilters,
  toArticleListFilter,
  type ParsedEdukasiFilters,
} from "./filters";

const emptyFilters: ParsedEdukasiFilters = {
  topic: undefined,
  agePresetKey: undefined,
  search: undefined,
  page: 1,
};

describe("parseEdukasiFilters", () => {
  it("returns the empty filter for an empty query", () => {
    expect(parseEdukasiFilters({})).toEqual(emptyFilters);
  });

  it("accepts a known topic, age preset, and pagination", () => {
    const parsed = parseEdukasiFilters({
      topik: "gizi",
      usia: "6-12",
      cari: "asi",
      halaman: "3",
    });
    expect(parsed).toEqual({
      topic: "gizi",
      agePresetKey: "6-12",
      search: "asi",
      page: 3,
    });
  });

  it("drops unknown topic and preset values silently", () => {
    const parsed = parseEdukasiFilters({
      topik: "not-a-topic",
      usia: "not-a-preset",
    });
    expect(parsed.topic).toBeUndefined();
    expect(parsed.agePresetKey).toBeUndefined();
  });

  it("rejects a search shorter than the minimum length", () => {
    const short = "x".repeat(EDUCATION_SEARCH_MIN_LENGTH - 1);
    const parsed = parseEdukasiFilters({ cari: short });
    expect(parsed.search).toBeUndefined();
  });

  it("rejects a search longer than the maximum length", () => {
    const long = "x".repeat(81);
    const parsed = parseEdukasiFilters({ cari: long });
    expect(parsed.search).toBeUndefined();
  });

  it("coerces non-numeric and zero page values back to 1", () => {
    expect(parseEdukasiFilters({ halaman: "abc" }).page).toBe(1);
    expect(parseEdukasiFilters({ halaman: "0" }).page).toBe(1);
    expect(parseEdukasiFilters({ halaman: "-2" }).page).toBe(1);
  });

  it("uses only the first value when an array of values is provided", () => {
    const parsed = parseEdukasiFilters({ topik: ["gizi", "imunisasi"] });
    expect(parsed.topic).toBe("gizi");
  });

  it("lowercases the topic and preset before validation", () => {
    const parsed = parseEdukasiFilters({ topik: "GIZI", usia: "PRAKELAHIRAN" });
    expect(parsed.topic).toBe("gizi");
    expect(parsed.agePresetKey).toBe("prakelahiran");
  });
});

describe("toArticleListFilter", () => {
  it("always includes pagination derived from the page index", () => {
    const filter = toArticleListFilter({ ...emptyFilters, page: 4 });
    expect(filter.limit).toBe(EDUCATION_PAGE_SIZE);
    expect(filter.offset).toBe((4 - 1) * EDUCATION_PAGE_SIZE);
  });

  it("translates a prenatal preset into a discriminated prenatal range", () => {
    const filter = toArticleListFilter({
      ...emptyFilters,
      agePresetKey: "prakelahiran",
    });
    expect(filter.ageRange).toEqual({ kind: "prenatal" });
  });

  it("translates a child preset into its bounded range", () => {
    const filter = toArticleListFilter({
      ...emptyFilters,
      agePresetKey: "12-24",
    });
    expect(filter.ageRange).toEqual({
      kind: "child",
      minAgeMonths: 12,
      maxAgeMonths: 24,
    });
  });

  it("forwards the topic and search when set", () => {
    const filter = toArticleListFilter({
      ...emptyFilters,
      topic: "imunisasi",
      search: "mpasi",
    });
    expect(filter.topic).toBe("imunisasi");
    expect(filter.search).toBe("mpasi");
  });

  it("omits ageRange when the preset is unknown to the catalog", () => {
    const filter = toArticleListFilter({
      ...emptyFilters,
      agePresetKey: "not-in-catalog",
    });
    expect(filter.ageRange).toBeUndefined();
  });
});

describe("buildEdukasiHref", () => {
  it("returns the bare path when no filter is set", () => {
    expect(buildEdukasiHref(emptyFilters)).toBe("/edukasi");
  });

  it("encodes the active topic and preset into the query string", () => {
    expect(
      buildEdukasiHref(emptyFilters, { topic: "gizi", agePresetKey: "0-6" }),
    ).toBe("/edukasi?topik=gizi&usia=0-6");
  });

  it("preserves untouched filters when overriding only one", () => {
    const base: ParsedEdukasiFilters = {
      topic: "gizi",
      agePresetKey: "0-6",
      search: "asi",
      page: 1,
    };
    expect(buildEdukasiHref(base, { topic: "imunisasi" })).toBe(
      "/edukasi?topik=imunisasi&usia=0-6&cari=asi",
    );
  });

  it("clears a filter when `all` (or null for search) is passed", () => {
    const base: ParsedEdukasiFilters = {
      topic: "gizi",
      agePresetKey: "0-6",
      search: "asi",
      page: 2,
    };
    expect(
      buildEdukasiHref(base, {
        topic: "all",
        agePresetKey: "all",
        search: null,
      }),
    ).toBe("/edukasi");
  });

  it("resets the page to 1 whenever a filter changes", () => {
    const base: ParsedEdukasiFilters = {
      topic: "gizi",
      agePresetKey: undefined,
      search: undefined,
      page: 4,
    };
    expect(buildEdukasiHref(base, { topic: "imunisasi" })).toBe(
      "/edukasi?topik=imunisasi",
    );
  });

  it("preserves the current page when only the page is overridden", () => {
    const base: ParsedEdukasiFilters = {
      topic: "gizi",
      agePresetKey: undefined,
      search: undefined,
      page: 2,
    };
    expect(buildEdukasiHref(base, { page: 3 })).toBe(
      "/edukasi?topik=gizi&halaman=3",
    );
  });

  it("omits the page param when the resulting page is 1", () => {
    const base: ParsedEdukasiFilters = {
      topic: undefined,
      agePresetKey: undefined,
      search: undefined,
      page: 1,
    };
    expect(buildEdukasiHref(base, { page: 1 })).toBe("/edukasi");
  });
});

describe("hasActiveEdukasiFilters", () => {
  it("returns false when nothing is filtered", () => {
    expect(hasActiveEdukasiFilters(emptyFilters)).toBe(false);
  });

  it.each([
    ["topic", { ...emptyFilters, topic: "gizi" as const }],
    ["age preset", { ...emptyFilters, agePresetKey: "0-6" }],
    ["search", { ...emptyFilters, search: "asi" }],
  ])("returns true when only %s is set", (_label, filters) => {
    expect(hasActiveEdukasiFilters(filters)).toBe(true);
  });

  it("ignores the page index — paging alone is not a filter", () => {
    expect(hasActiveEdukasiFilters({ ...emptyFilters, page: 5 })).toBe(false);
  });
});
