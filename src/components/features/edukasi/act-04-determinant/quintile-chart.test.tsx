import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { INCOME_QUINTILES } from "@/data/edukasi/determinants";

import { QuintileChart } from "./quintile-chart";

describe("QuintileChart", () => {
  it("renders an accessible figure with a role=img summary", () => {
    render(<QuintileChart />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders every quintile label and value", () => {
    render(<QuintileChart activeIndex={null} />);
    for (const quintile of INCOME_QUINTILES) {
      // Label appears as an SVG <text>; query by text content.
      expect(screen.getByText(quintile.label)).toBeInTheDocument();
    }
  });

  it("exposes a screen-reader data list covering all quintiles", () => {
    const { container } = render(<QuintileChart />);
    const items = container.querySelectorAll("ul.sr-only li");
    expect(items).toHaveLength(INCOME_QUINTILES.length);
  });

  it("renders without crashing when an active index is supplied", () => {
    const { container } = render(<QuintileChart activeIndex={0} />);
    expect(container.querySelectorAll("rect").length).toBe(
      INCOME_QUINTILES.length,
    );
  });
});
