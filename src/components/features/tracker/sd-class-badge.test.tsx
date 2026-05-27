import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SD_CLASS_DISPLAY } from "@/config/tracker";

import { SdClassBadge } from "./sd-class-badge";

describe("SdClassBadge", () => {
  it("renders the localised label for the given SD class", () => {
    render(<SdClassBadge sdClass="pendek" />);
    expect(screen.getByText(SD_CLASS_DISPLAY.pendek.label)).toBeInTheDocument();
  });

  it("renders distinct labels for different SD classes", () => {
    const { rerender } = render(<SdClassBadge sdClass="normal" />);
    expect(screen.getByText(SD_CLASS_DISPLAY.normal.label)).toBeInTheDocument();

    rerender(<SdClassBadge sdClass="sangat_kurus" />);
    expect(
      screen.getByText(SD_CLASS_DISPLAY.sangat_kurus.label),
    ).toBeInTheDocument();
  });

  it("forwards an extra className to the underlying badge", () => {
    render(<SdClassBadge sdClass="normal" className="ml-2" />);
    expect(screen.getByText(SD_CLASS_DISPLAY.normal.label)).toHaveClass("ml-2");
  });
});
