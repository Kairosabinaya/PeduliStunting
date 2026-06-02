import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { TrackerGrowthIndicatorStatus } from "@/application/tracking/tracker-dashboard-view-model";

import { GrowthStatusTile } from "./growth-status-tile";

function status(measuredAt: string): TrackerGrowthIndicatorStatus {
  return {
    indicator: "TB_U",
    measuredAt,
    zScore: -2.1,
    sdClass: "pendek",
    riskLevel: "watch",
    weightKg: null,
    heightCm: 70,
    headCircumferenceCm: null,
    muacCm: null,
  };
}

describe("GrowthStatusTile", () => {
  it("surfaces its own date when the value comes from an older measurement", () => {
    render(
      <ul>
        <GrowthStatusTile
          status={status("2024-02-01")}
          latestMeasuredAt="2024-03-01"
        />
      </ul>,
    );
    // The TB/U value here was taken on 1 Feb, not the header's latest date,
    // so the tile must say so instead of letting it read as the latest reading.
    expect(screen.getByText(/Diukur/)).toBeInTheDocument();
  });

  it("omits the date when the value is from the latest measurement", () => {
    render(
      <ul>
        <GrowthStatusTile
          status={status("2024-03-01")}
          latestMeasuredAt="2024-03-01"
        />
      </ul>,
    );
    expect(screen.queryByText(/Diukur/)).not.toBeInTheDocument();
  });
});
