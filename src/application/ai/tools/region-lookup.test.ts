import { describe, expect, it } from "vitest";

import type { RegionRef } from "@/application/ai/cards/ai-card";

import { matchRegions } from "./region-lookup";

const REGIONS: readonly RegionRef[] = [
  { kodeBps: "3578", kabupatenKota: "Kota Surabaya", provinsi: "Jawa Timur" },
  {
    kodeBps: "3525",
    kabupatenKota: "Kabupaten Gresik",
    provinsi: "Jawa Timur",
  },
  { kodeBps: "3273", kabupatenKota: "Kota Bandung", provinsi: "Jawa Barat" },
];

describe("matchRegions", () => {
  it("matches ignoring the kota/kabupaten prefix", () => {
    const result = matchRegions(REGIONS, "surabaya", 5);
    expect(result.map((r) => r.kodeBps)).toContain("3578");
  });

  it("returns an empty list for a blank query", () => {
    expect(matchRegions(REGIONS, "   ", 5)).toEqual([]);
  });

  it("respects the limit", () => {
    expect(matchRegions(REGIONS, "ka", 1).length).toBeLessThanOrEqual(1);
  });

  it("returns nothing for an unknown name", () => {
    expect(matchRegions(REGIONS, "atlantis", 5)).toEqual([]);
  });
});
