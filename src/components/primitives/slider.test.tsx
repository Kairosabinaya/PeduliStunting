import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Slider } from "./slider";

function renderSlider(overrides: Partial<React.ComponentProps<typeof Slider>> = {}) {
  const onChange = vi.fn();
  const utils = render(
    <Slider
      ariaLabel="Delta prediktor"
      value={0}
      min={-3}
      max={3}
      step={0.1}
      onChange={onChange}
      {...overrides}
    />,
  );
  return { ...utils, onChange };
}

describe("Slider", () => {
  it("renders the current value through aria-valuetext", () => {
    renderSlider({
      value: 1.5,
      formatValue: (v) => v.toFixed(2),
    });
    const slider = screen.getByRole("slider", { name: /delta prediktor/i });
    expect(slider).toHaveAttribute("aria-valuenow", "1.5");
    expect(slider).toHaveAttribute("aria-valuetext", "1.50");
  });

  it("forwards numeric changes through the onChange callback", () => {
    const { onChange } = renderSlider();
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "1.2" } });
    expect(onChange).toHaveBeenCalledWith(1.2);
  });

  it("ignores non-finite parsed values", () => {
    const { onChange } = renderSlider();
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "not-a-number" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("publishes aria-valuemin and aria-valuemax from props", () => {
    renderSlider({ min: -2, max: 2 });
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuemin", "-2");
    expect(slider).toHaveAttribute("aria-valuemax", "2");
  });

  it("renders provided tick labels", () => {
    renderSlider({
      ticks: [
        { value: -1, label: "-1" },
        { value: 0, label: "0" },
        { value: 1, label: "+1" },
      ],
    });
    expect(screen.getByText("-1")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("renders the hint paragraph when supplied", () => {
    renderSlider({ hint: "Geser untuk mengubah" });
    expect(screen.getByText("Geser untuk mengubah")).toBeInTheDocument();
  });
});
