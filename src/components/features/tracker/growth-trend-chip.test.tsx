import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TREND_COPY } from "@/config/tracker";

import { GrowthTrendChip } from "./growth-trend-chip";

describe("GrowthTrendChip", () => {
  it("renders the 'not enough' state when no delta available", () => {
    render(
      <GrowthTrendChip
        result={{
          trend: "not_enough",
          deltaZ: null,
          latestZ: null,
          previousZ: null,
        }}
      />,
    );
    expect(screen.getByText(TREND_COPY.notEnough.label)).toBeInTheDocument();
    expect(screen.queryByText(/Naik|Turun/)).not.toBeInTheDocument();
  });

  it("formats positive delta with a leading + sign", () => {
    render(
      <GrowthTrendChip
        result={{
          trend: "improving",
          deltaZ: 0.5,
          latestZ: -1,
          previousZ: -1.5,
        }}
      />,
    );
    expect(screen.getByText(TREND_COPY.improving.label)).toBeInTheDocument();
    expect(screen.getByText(/Naik 0\.50 poin/i)).toBeInTheDocument();
  });

  it("formats negative delta as monitor", () => {
    render(
      <GrowthTrendChip
        result={{
          trend: "monitor",
          deltaZ: -0.6,
          latestZ: -1.8,
          previousZ: -1.2,
        }}
      />,
    );
    expect(screen.getByText(TREND_COPY.monitor.label)).toBeInTheDocument();
    expect(screen.getByText(/Turun 0\.60 poin/i)).toBeInTheDocument();
  });
});
