import { describe, expect, it } from "vitest";

import {
  CATEGORY_BADGE_TONE,
  CATEGORY_FILL_CLASS,
  DEFAULT_MAP_SOURCE,
  DEFAULT_MAP_YEAR,
  INDONESIA_BBOX,
  MAP_COPY,
  MAP_LEGEND,
  MAP_SOURCES,
  MAP_SOURCE_OPTIONS,
  MAP_SELECTION_PARAM,
  MAP_SOURCE_PARAM,
  MAP_VIEWBOX,
  MAP_YEAR_PARAM,
} from "./map";
import { MAX_YEAR, SUPPORTED_YEARS } from "./years";
import { STUNTING_CATEGORIES } from "@/domain/region/value-objects/stunting-category";

describe("map config", () => {
  it("uses stable URL search-param keys", () => {
    expect(MAP_YEAR_PARAM).toBe("tahun");
    expect(MAP_SOURCE_PARAM).toBe("sumber");
    expect(MAP_SELECTION_PARAM).toBe("wilayah");
  });

  it("defaults to the latest supported year and observed data source", () => {
    expect(SUPPORTED_YEARS).toContain(DEFAULT_MAP_YEAR);
    expect(DEFAULT_MAP_YEAR).toBe(MAX_YEAR);
    expect(DEFAULT_MAP_SOURCE).toBe("actual");
    expect(MAP_SOURCES).toContain(DEFAULT_MAP_SOURCE);
  });

  it("exposes valid bbox bounds for Indonesia", () => {
    expect(INDONESIA_BBOX.minLon).toBeLessThan(INDONESIA_BBOX.maxLon);
    expect(INDONESIA_BBOX.minLat).toBeLessThan(INDONESIA_BBOX.maxLat);
    expect(INDONESIA_BBOX.minLon).toBeGreaterThan(90);
    expect(INDONESIA_BBOX.maxLon).toBeLessThan(145);
  });

  it("defines a viewBox with positive dimensions", () => {
    expect(MAP_VIEWBOX.width).toBeGreaterThan(0);
    expect(MAP_VIEWBOX.height).toBeGreaterThan(0);
  });

  it("maps every StuntingCategory to a fill and a badge tone", () => {
    for (const category of STUNTING_CATEGORIES) {
      expect(CATEGORY_FILL_CLASS[category]).toMatch(/^fill-ordinal-/u);
      expect(CATEGORY_BADGE_TONE[category]).toBe(category.toLowerCase());
    }
  });

  it("orders the legend from lowest to highest category", () => {
    const order = MAP_LEGEND.map((entry) => entry.category);
    expect(order).toEqual(["Rendah", "Sedang", "Tinggi"]);
    for (const entry of MAP_LEGEND) {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
    }
  });

  it("offers both data source toggles with descriptive labels", () => {
    const values = MAP_SOURCE_OPTIONS.map((option) => option.value);
    expect(values).toEqual([...MAP_SOURCES]);
    for (const option of MAP_SOURCE_OPTIONS) {
      expect(option.label.length).toBeGreaterThan(0);
      expect(option.hint.length).toBeGreaterThan(0);
    }
  });

  it("provides Indonesian copy for all empty / informational states", () => {
    for (const value of Object.values(MAP_COPY)) {
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
