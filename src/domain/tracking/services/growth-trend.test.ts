import { describe, expect, it } from "vitest";

import { computeGrowthTrend } from "./growth-trend";

function point(measuredAt: string, zScores: Readonly<Record<string, number>>) {
  return { measuredAt, zScores };
}

describe("computeGrowthTrend", () => {
  it("returns not_enough when there are zero measurements", () => {
    const result = computeGrowthTrend([], "TB_U");
    expect(result.trend).toBe("not_enough");
    expect(result.deltaZ).toBeNull();
  });

  it("returns not_enough when only one measurement has the indicator", () => {
    const result = computeGrowthTrend(
      [point("2026-01-01", { TB_U: -1.5 })],
      "TB_U",
    );
    expect(result.trend).toBe("not_enough");
    expect(result.latestZ).toBe(-1.5);
    expect(result.previousZ).toBeNull();
  });

  it("classifies improving when delta z >= +0.25 SD", () => {
    const result = computeGrowthTrend(
      [
        point("2026-04-01", { TB_U: -1.0 }),
        point("2026-01-01", { TB_U: -1.5 }),
      ],
      "TB_U",
    );
    expect(result.trend).toBe("improving");
    expect(result.deltaZ).toBeCloseTo(0.5, 5);
  });

  it("classifies monitor when delta z <= -0.25 SD", () => {
    const result = computeGrowthTrend(
      [
        point("2026-04-01", { TB_U: -1.8 }),
        point("2026-01-01", { TB_U: -1.2 }),
      ],
      "TB_U",
    );
    expect(result.trend).toBe("monitor");
    expect(result.deltaZ).toBeCloseTo(-0.6, 5);
  });

  it("classifies stable when delta z is within ±0.25 SD", () => {
    const result = computeGrowthTrend(
      [
        point("2026-04-01", { TB_U: -1.3 }),
        point("2026-01-01", { TB_U: -1.2 }),
      ],
      "TB_U",
    );
    expect(result.trend).toBe("stable");
  });

  it("ignores measurements lacking the requested indicator", () => {
    const result = computeGrowthTrend(
      [
        point("2026-04-01", { BB_U: -0.5 }),
        point("2026-03-01", { TB_U: -1.5 }),
        point("2026-01-01", { TB_U: -2.2 }),
      ],
      "TB_U",
    );
    expect(result.trend).toBe("improving");
    expect(result.latestZ).toBe(-1.5);
    expect(result.previousZ).toBe(-2.2);
  });

  it("uses the two most recent measurements (orders by date)", () => {
    const result = computeGrowthTrend(
      [
        point("2026-01-01", { TB_U: -2.5 }),
        point("2026-05-01", { TB_U: -1.0 }),
        point("2026-03-01", { TB_U: -1.5 }),
      ],
      "TB_U",
    );
    expect(result.latestZ).toBe(-1.0);
    expect(result.previousZ).toBe(-1.5);
    expect(result.trend).toBe("improving");
  });
});
