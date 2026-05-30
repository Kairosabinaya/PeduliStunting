import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgressRing } from "./progress-ring";

describe("ProgressRing", () => {
  it("renders the inner content slot", () => {
    render(
      <ProgressRing value={3} total={9} ariaLabel="3 dari 9">
        <span>3/9</span>
      </ProgressRing>,
    );
    expect(screen.getByText("3/9")).toBeInTheDocument();
  });

  it("exposes an accessible label", () => {
    render(<ProgressRing value={1} total={4} ariaLabel="1 dari 4" />);
    expect(screen.getByRole("img", { name: "1 dari 4" })).toBeInTheDocument();
  });

  it("clamps the ratio at 1 when value exceeds total", () => {
    const { container } = render(
      <ProgressRing value={5} total={4} ariaLabel="penuh" />,
    );
    const arc = container.querySelectorAll("circle")[1];
    expect(arc?.getAttribute("stroke-dashoffset")).toBe("0");
  });

  it("renders an empty ring when total is zero", () => {
    const { container } = render(
      <ProgressRing value={0} total={0} ariaLabel="kosong" />,
    );
    const arc = container.querySelectorAll("circle")[1];
    const dashOffset = Number(arc?.getAttribute("stroke-dashoffset") ?? "0");
    const dashArray = Number(arc?.getAttribute("stroke-dasharray") ?? "0");
    expect(dashOffset).toBeCloseTo(dashArray, 1);
  });
});
