import { describe, expect, it } from "vitest";

import {
  DEFAULT_MAP_SOURCE,
  DEFAULT_MAP_YEAR,
  MAP_SELECTION_PARAM,
  MAP_SOURCE_PARAM,
  MAP_YEAR_PARAM,
} from "@/config/map";

import { buildMapHref, parseMapSearchParams } from "./map-search-params";

describe("parseMapSearchParams", () => {
  it("returns defaults when input is undefined", () => {
    const parsed = parseMapSearchParams(undefined);
    expect(parsed.tahun).toBe(DEFAULT_MAP_YEAR);
    expect(parsed.sumber).toBe(DEFAULT_MAP_SOURCE);
    expect(parsed.selection).toBeNull();
  });

  it("returns defaults when params are absent", () => {
    const parsed = parseMapSearchParams({});
    expect(parsed.tahun).toBe(DEFAULT_MAP_YEAR);
    expect(parsed.sumber).toBe(DEFAULT_MAP_SOURCE);
    expect(parsed.selection).toBeNull();
  });

  it("parses a supported year", () => {
    const parsed = parseMapSearchParams({ [MAP_YEAR_PARAM]: "2022" });
    expect(parsed.tahun).toBe(2022);
  });

  it("falls back to default year when year is unsupported", () => {
    const parsed = parseMapSearchParams({ [MAP_YEAR_PARAM]: "1999" });
    expect(parsed.tahun).toBe(DEFAULT_MAP_YEAR);
  });

  it("falls back to default year when year is not numeric", () => {
    const parsed = parseMapSearchParams({ [MAP_YEAR_PARAM]: "tahun-ini" });
    expect(parsed.tahun).toBe(DEFAULT_MAP_YEAR);
  });

  it("parses a known data source", () => {
    const parsed = parseMapSearchParams({
      [MAP_SOURCE_PARAM]: "predicted",
    });
    expect(parsed.sumber).toBe("predicted");
  });

  it("falls back to default source when source is unknown", () => {
    const parsed = parseMapSearchParams({
      [MAP_SOURCE_PARAM]: "random-source",
    });
    expect(parsed.sumber).toBe(DEFAULT_MAP_SOURCE);
  });

  it("keeps a four-digit selection", () => {
    const parsed = parseMapSearchParams({ [MAP_SELECTION_PARAM]: "1101" });
    expect(parsed.selection).toBe("1101");
  });

  it("rejects a selection that is not four digits", () => {
    const parsed = parseMapSearchParams({ [MAP_SELECTION_PARAM]: "11" });
    expect(parsed.selection).toBeNull();
  });

  it("rejects a selection that contains letters", () => {
    const parsed = parseMapSearchParams({ [MAP_SELECTION_PARAM]: "11AB" });
    expect(parsed.selection).toBeNull();
  });

  it("picks the first value when a param is provided as an array", () => {
    const parsed = parseMapSearchParams({
      [MAP_YEAR_PARAM]: ["2023", "2024"],
    });
    expect(parsed.tahun).toBe(2023);
  });
});

describe("buildMapHref", () => {
  it("returns an empty string when there are no params", () => {
    const href = buildMapHref(new URLSearchParams(), {});
    expect(href).toBe("");
  });

  it("preserves params that are not in the patch", () => {
    const href = buildMapHref(
      new URLSearchParams({ tahun: "2022", lain: "x" }),
      {},
    );
    expect(href).toBe("?tahun=2022&lain=x");
  });

  it("overrides params with new values", () => {
    const href = buildMapHref(new URLSearchParams({ tahun: "2022" }), {
      tahun: "2024",
    });
    expect(href).toBe("?tahun=2024");
  });

  it("deletes params when the patch value is null", () => {
    const href = buildMapHref(
      new URLSearchParams({ tahun: "2022", wilayah: "1101" }),
      { wilayah: null },
    );
    expect(href).toBe("?tahun=2022");
  });

  it("adds a new param when it is not present", () => {
    const href = buildMapHref(new URLSearchParams({ tahun: "2024" }), {
      sumber: "predicted",
    });
    expect(href).toBe("?tahun=2024&sumber=predicted");
  });
});
