import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { GROWTH_INDICATOR_SHORT, SD_CLASS_DISPLAY } from "@/config/tracker";

import { IndicatorTabs } from "./indicator-tabs";

describe("IndicatorTabs", () => {
  it("renders one tab per growth indicator", () => {
    render(
      <IndicatorTabs value="TB_U" onChange={vi.fn()} latestSdClass={{}} />,
    );
    expect(
      screen.getByRole("tab", {
        name: new RegExp(GROWTH_INDICATOR_SHORT.TB_U),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", {
        name: new RegExp(GROWTH_INDICATOR_SHORT.BB_U),
      }),
    ).toBeInTheDocument();
  });

  it("marks the active tab with aria-selected", () => {
    render(
      <IndicatorTabs value="BB_U" onChange={vi.fn()} latestSdClass={{}} />,
    );
    const active = screen.getByRole("tab", {
      name: new RegExp(GROWTH_INDICATOR_SHORT.BB_U),
    });
    expect(active.getAttribute("aria-selected")).toBe("true");
  });

  it("calls onChange with the indicator when a tab is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <IndicatorTabs value="TB_U" onChange={onChange} latestSdClass={{}} />,
    );
    await user.click(
      screen.getByRole("tab", {
        name: new RegExp(GROWTH_INDICATOR_SHORT.BB_U),
      }),
    );
    expect(onChange).toHaveBeenCalledWith("BB_U");
  });

  it("shows an SD-class badge when supplied", () => {
    render(
      <IndicatorTabs
        value="TB_U"
        onChange={vi.fn()}
        latestSdClass={{ TB_U: "pendek" }}
      />,
    );
    expect(screen.getByText(SD_CLASS_DISPLAY.pendek.label)).toBeInTheDocument();
  });
});
