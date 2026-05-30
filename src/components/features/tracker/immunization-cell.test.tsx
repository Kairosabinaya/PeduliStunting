import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { IMMUNIZATION_CELL_COPY } from "@/config/tracker";

import { ImmunizationCell } from "./immunization-cell";

describe("ImmunizationCell", () => {
  it("renders the supplied label and status copy", () => {
    render(
      <ImmunizationCell
        label="BCG"
        status="done"
        ariaLabel="BCG (selesai)"
        onClick={vi.fn()}
      />,
    );
    expect(screen.getByText("BCG")).toBeInTheDocument();
    expect(
      screen.getByText(IMMUNIZATION_CELL_COPY.done.label),
    ).toBeInTheDocument();
  });

  it("invokes onClick when activated", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ImmunizationCell
        label="HB0"
        status="upcoming"
        ariaLabel="HB0 (akan datang)"
        onClick={onClick}
      />,
    );
    await user.click(screen.getByRole("button", { name: "HB0 (akan datang)" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders the missed copy without throwing", () => {
    render(
      <ImmunizationCell
        label="DPT-HB-Hib-2"
        status="missed"
        ariaLabel="DPT-HB-Hib 2 (terlewat)"
        onClick={vi.fn()}
      />,
    );
    expect(
      screen.getByText(IMMUNIZATION_CELL_COPY.missed.label),
    ).toBeInTheDocument();
  });
});
