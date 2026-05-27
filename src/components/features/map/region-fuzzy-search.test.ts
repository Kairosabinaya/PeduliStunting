import { describe, expect, it } from "vitest";

import type { RegionDto } from "@/application/region/dtos";

import { searchRegions } from "./region-fuzzy-search";

function r(
  kodeBps: string,
  kabupatenKota: string,
  provinsi: string,
): RegionDto {
  return {
    kodeBps,
    kabupatenKota,
    provinsi,
    tipe: "Kabupaten",
    latitude: 0,
    longitude: 0,
  } as RegionDto;
}

const REGIONS: readonly RegionDto[] = [
  r("3201", "Bogor", "Jawa Barat"),
  r("3273", "Bandung", "Jawa Barat"),
  r("3217", "Bandung Barat", "Jawa Barat"),
  r("1101", "Aceh Selatan", "Aceh"),
  r("1171", "Banda Aceh", "Aceh"),
  r("3100", "Jakarta Pusat", "DKI Jakarta"),
];

describe("searchRegions", () => {
  it("returns nothing for queries shorter than 2 characters", () => {
    expect(searchRegions(REGIONS, "", 8)).toHaveLength(0);
    expect(searchRegions(REGIONS, "b", 8)).toHaveLength(0);
  });

  it("ranks exact name matches above prefix matches", () => {
    const hits = searchRegions(REGIONS, "bandung", 8);
    expect(hits[0]?.region.kabupatenKota).toBe("Bandung");
    expect(hits[1]?.region.kabupatenKota).toBe("Bandung Barat");
  });

  it("matches across word boundaries", () => {
    const hits = searchRegions(REGIONS, "aceh", 8);
    const names = hits.map((h) => h.region.kabupatenKota);
    expect(names).toContain("Banda Aceh");
    expect(names).toContain("Aceh Selatan");
  });

  it("falls back to province match", () => {
    const hits = searchRegions(REGIONS, "dki", 8);
    expect(hits[0]?.region.kabupatenKota).toBe("Jakarta Pusat");
  });

  it("respects the limit", () => {
    expect(searchRegions(REGIONS, "ban", 1)).toHaveLength(1);
  });

  it("is diacritic-insensitive", () => {
    const hits = searchRegions(REGIONS, "bándung", 8);
    expect(hits[0]?.region.kabupatenKota).toBe("Bandung");
  });
});
