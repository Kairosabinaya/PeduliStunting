import { describe, expect, it } from "vitest";

import {
  DASHBOARD_ERROR,
  DASHBOARD_FOOTER,
  DASHBOARD_INSIGHTS,
  DASHBOARD_METRIC_TILES,
  DASHBOARD_MODEL,
  DASHBOARD_SIMULATOR,
  DATA_HEADER,
  PREDIKSI_HEADER,
} from "./dashboard";

describe("dashboard config", () => {
  it("exposes Data and Prediksi header copy with eyebrow, title, and description", () => {
    for (const header of [DATA_HEADER, PREDIKSI_HEADER]) {
      expect(header.eyebrow.length).toBeGreaterThan(0);
      expect(header.title.length).toBeGreaterThan(0);
      expect(header.description.length).toBeGreaterThan(0);
    }
  });

  it("declares metric tiles for accuracy, qwk, mae with valid precision", () => {
    const keys = DASHBOARD_METRIC_TILES.map((tile) => tile.key);
    expect(keys).toContain("accuracy");
    expect(keys).toContain("qwk");
    expect(keys).toContain("mae");
    for (const tile of DASHBOARD_METRIC_TILES) {
      expect(Number.isInteger(tile.precision)).toBe(true);
      expect(tile.precision).toBeGreaterThanOrEqual(0);
      expect(tile.label.length).toBeGreaterThan(0);
    }
  });

  it("describes the four prediction steps with step/title/body", () => {
    expect(DASHBOARD_MODEL.components).toHaveLength(4);
    DASHBOARD_MODEL.components.forEach((component, index) => {
      expect(component.step).toBe(index + 1);
      expect(component.title.length).toBeGreaterThan(0);
      expect(component.body.length).toBeGreaterThan(0);
    });
  });

  it("cites both SSGI/SKI Kemenkes and BPS as data sources", () => {
    expect(DASHBOARD_FOOTER.sources).toMatch(/SSGI/);
    expect(DASHBOARD_FOOTER.sources).toMatch(/BPS/);
  });

  it("uses positive ranking limits", () => {
    expect(DASHBOARD_INSIGHTS.rankingLimit).toBeGreaterThan(0);
    expect(DASHBOARD_INSIGHTS.provinceLimit).toBeGreaterThan(0);
    expect(DASHBOARD_INSIGHTS.moverLimit).toBeGreaterThan(0);
  });

  it("provides simulator and error copy", () => {
    expect(DASHBOARD_SIMULATOR.regionLabel.length).toBeGreaterThan(0);
    expect(DASHBOARD_SIMULATOR.inactiveBadge.length).toBeGreaterThan(0);
    expect(DASHBOARD_ERROR.title.length).toBeGreaterThan(0);
    expect(DASHBOARD_ERROR.retryLabel.length).toBeGreaterThan(0);
  });
});
