import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrainGrowthCurve } from "./brain-growth-curve";

describe("BrainGrowthCurve", () => {
  it("renders all three brain-development values via their accessible labels", () => {
    render(<BrainGrowthCurve enabled />);
    expect(screen.getByLabelText("25%")).toBeInTheDocument();
    expect(screen.getByLabelText("70%")).toBeInTheDocument();
    expect(screen.getByLabelText("85%")).toBeInTheDocument();
  });

  it("renders the age legend for each milestone", () => {
    render(<BrainGrowthCurve enabled />);
    expect(screen.getByText(/saat lahir/i)).toBeInTheDocument();
    expect(screen.getByText(/usia 0.?1 tahun/i)).toBeInTheDocument();
    expect(screen.getByText(/usia 1.?3 tahun/i)).toBeInTheDocument();
  });
});
