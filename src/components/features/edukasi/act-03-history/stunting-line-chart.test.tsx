import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StuntingLineChart } from "./stunting-line-chart";

describe("StuntingLineChart", () => {
  it("labels only the milestone years on the x-axis to avoid overlap", () => {
    render(<StuntingLineChart />);
    // First reading, the latest "today" value, and the two targets are kept.
    ["2013", "2024", "2029", "2045"].forEach((year) => {
      expect(screen.getByText(year)).toBeInTheDocument();
    });
    // The clustered mid-decade surveys no longer carry an axis label.
    ["2019", "2021", "2022", "2023"].forEach((year) => {
      expect(screen.queryByText(year)).not.toBeInTheDocument();
    });
  });
});
