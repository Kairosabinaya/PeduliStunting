import { describe, expect, it } from "vitest";

import {
  DASHBOARD_COMPARISON_SECTION,
  DASHBOARD_CONTRIBUTION_SECTION,
  DASHBOARD_DICTIONARY_SECTION,
  DASHBOARD_HEADER,
  DASHBOARD_METRICS_SECTION,
  DASHBOARD_METRIC_TILES,
  DASHBOARD_MORAN_SECTION,
  DASHBOARD_WHATIF_DELTA,
  DASHBOARD_WHATIF_SECTION,
} from "./dashboard";

describe("dashboard config", () => {
  it("exposes header copy with eyebrow, title, and description", () => {
    expect(DASHBOARD_HEADER.eyebrow.length).toBeGreaterThan(0);
    expect(DASHBOARD_HEADER.title.length).toBeGreaterThan(0);
    expect(DASHBOARD_HEADER.description.length).toBeGreaterThan(0);
  });

  it("declares metric tiles for accuracy, qwk, mae, log_score", () => {
    const keys = DASHBOARD_METRIC_TILES.map((tile) => tile.key);
    expect(keys).toContain("accuracy");
    expect(keys).toContain("qwk");
    expect(keys).toContain("mae");
    expect(keys).toContain("log_score");
  });

  it("marks higherIsBetter correctly per metric definition", () => {
    const byKey = Object.fromEntries(
      DASHBOARD_METRIC_TILES.map((tile) => [tile.key, tile]),
    );
    expect(byKey.accuracy?.higherIsBetter).toBe(true);
    expect(byKey.qwk?.higherIsBetter).toBe(true);
    expect(byKey.mae?.higherIsBetter).toBe(false);
    expect(byKey.log_score?.higherIsBetter).toBe(true);
  });

  it("uses positive integer precision for every metric tile", () => {
    for (const tile of DASHBOARD_METRIC_TILES) {
      expect(Number.isInteger(tile.precision)).toBe(true);
      expect(tile.precision).toBeGreaterThanOrEqual(0);
      expect(tile.label.length).toBeGreaterThan(0);
      expect(tile.description.length).toBeGreaterThan(0);
    }
  });

  it("provides empty/error/loading copy for every data section", () => {
    const sections = [
      DASHBOARD_METRICS_SECTION,
      DASHBOARD_COMPARISON_SECTION,
      DASHBOARD_MORAN_SECTION,
      DASHBOARD_DICTIONARY_SECTION,
    ];
    for (const section of sections) {
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.description.length).toBeGreaterThan(0);
      expect(section.loadingLabel.length).toBeGreaterThan(0);
      expect(section.errorTitle.length).toBeGreaterThan(0);
    }
  });

  it("declares column labels for the model comparison table", () => {
    const cols = DASHBOARD_COMPARISON_SECTION.columns;
    expect(cols.name.length).toBeGreaterThan(0);
    expect(cols.accuracy.length).toBeGreaterThan(0);
    expect(cols.qwk.length).toBeGreaterThan(0);
    expect(cols.mae.length).toBeGreaterThan(0);
    expect(cols.logScore.length).toBeGreaterThan(0);
    expect(cols.selected.length).toBeGreaterThan(0);
  });

  it("describes both protective and risk groups for the contribution panel", () => {
    expect(DASHBOARD_CONTRIBUTION_SECTION.protectiveTitle.length).toBeGreaterThan(
      0,
    );
    expect(DASHBOARD_CONTRIBUTION_SECTION.riskTitle.length).toBeGreaterThan(0);
    expect(DASHBOARD_CONTRIBUTION_SECTION.neutralTitle.length).toBeGreaterThan(
      0,
    );
  });

  it("delivers what-if copy and an inclusive symmetric delta range", () => {
    expect(DASHBOARD_WHATIF_SECTION.title.length).toBeGreaterThan(0);
    expect(DASHBOARD_WHATIF_SECTION.deltaLabel.length).toBeGreaterThan(0);
    expect(DASHBOARD_WHATIF_DELTA.min).toBeLessThan(DASHBOARD_WHATIF_DELTA.max);
    expect(DASHBOARD_WHATIF_DELTA.step).toBeGreaterThan(0);
    expect(DASHBOARD_WHATIF_DELTA.default).toBeGreaterThanOrEqual(
      DASHBOARD_WHATIF_DELTA.min,
    );
    expect(DASHBOARD_WHATIF_DELTA.default).toBeLessThanOrEqual(
      DASHBOARD_WHATIF_DELTA.max,
    );
  });
});
