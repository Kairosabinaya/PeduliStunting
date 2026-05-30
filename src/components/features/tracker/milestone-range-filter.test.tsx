import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MILESTONE_RANGE_FILTER_COPY } from "@/config/tracker";

import { MilestoneRangeFilter } from "./milestone-range-filter";

describe("MilestoneRangeFilter", () => {
  it("highlights the current selection", () => {
    render(
      <MilestoneRangeFilter
        value="current"
        onChange={vi.fn()}
        childAgeMonths={4}
      />,
    );
    const currentRadio = screen.getByRole("radio", {
      name: MILESTONE_RANGE_FILTER_COPY.optionCurrent,
    });
    expect(currentRadio.getAttribute("aria-checked")).toBe("true");
  });

  it("calls onChange with the next mode when toggled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MilestoneRangeFilter
        value="current"
        onChange={onChange}
        childAgeMonths={4}
      />,
    );
    await user.click(
      screen.getByRole("radio", {
        name: MILESTONE_RANGE_FILTER_COPY.optionAll,
      }),
    );
    expect(onChange).toHaveBeenCalledWith("all");
  });

  it("shows the child age summary line", () => {
    render(
      <MilestoneRangeFilter
        value="current"
        onChange={vi.fn()}
        childAgeMonths={11}
      />,
    );
    expect(
      screen.getByText(MILESTONE_RANGE_FILTER_COPY.summaryFormat(11)),
    ).toBeInTheDocument();
  });
});
