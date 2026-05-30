import { describe, expect, it } from "vitest";

import { CHOROPLETH, countBySeverity } from "./choropleth-data";

describe("choropleth-data", () => {
  describe("CHOROPLETH", () => {
    it("parses the committed build artifact into a valid shape", () => {
      expect(CHOROPLETH.paths.length).toBeGreaterThan(400);
      expect(CHOROPLETH.viewBox.width).toBeGreaterThan(0);
      expect(CHOROPLETH.viewBox.height).toBeGreaterThan(0);
    });

    it("gives every district a non-empty path string", () => {
      for (const path of CHOROPLETH.paths) {
        expect(path.d.length).toBeGreaterThan(0);
        expect(path.d.startsWith("M")).toBe(true);
      }
    });

    it("only uses the three known severity tiers or null", () => {
      const allowed = new Set(["Rendah", "Sedang", "Tinggi", null]);
      for (const path of CHOROPLETH.paths) {
        expect(allowed.has(path.severity)).toBe(true);
      }
    });
  });

  describe("countBySeverity", () => {
    it("tallies each severity tier and the no-data bucket", () => {
      const counts = countBySeverity([
        {
          kodeBps: "1",
          kabupatenKota: "A",
          provinsi: "X",
          severity: "Rendah",
          prevalence: 10,
          d: "M0 0Z",
        },
        {
          kodeBps: "2",
          kabupatenKota: "B",
          provinsi: "X",
          severity: "Tinggi",
          prevalence: 33,
          d: "M0 0Z",
        },
        {
          kodeBps: "3",
          kabupatenKota: "C",
          provinsi: "X",
          severity: "Tinggi",
          prevalence: 31,
          d: "M0 0Z",
        },
        {
          kodeBps: "4",
          kabupatenKota: "D",
          provinsi: "X",
          severity: null,
          prevalence: null,
          d: "M0 0Z",
        },
      ]);
      expect(counts).toEqual({
        Rendah: 1,
        Sedang: 0,
        Tinggi: 2,
        tidakTersedia: 1,
      });
    });

    it("returns all-zero counts for an empty list", () => {
      expect(countBySeverity([])).toEqual({
        Rendah: 0,
        Sedang: 0,
        Tinggi: 0,
        tidakTersedia: 0,
      });
    });
  });
});
