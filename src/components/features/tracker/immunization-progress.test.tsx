import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IMMUNIZATION_PROGRESS_COPY } from "@/config/tracker";

import { ImmunizationProgress } from "./immunization-progress";

describe("ImmunizationProgress", () => {
  it("renders the done/due ratio inside the ring", () => {
    render(<ImmunizationProgress done={3} due={9} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(/dari 9/)).toBeInTheDocument();
  });

  it("uses an accessible aria label on the ring", () => {
    render(<ImmunizationProgress done={5} due={12} />);
    expect(
      screen.getByRole("img", {
        name: IMMUNIZATION_PROGRESS_COPY.ariaLabelFormat(5, 12),
      }),
    ).toBeInTheDocument();
  });

  it("renders the legend rows", () => {
    render(<ImmunizationProgress done={0} due={0} />);
    expect(
      screen.getByText(IMMUNIZATION_PROGRESS_COPY.legendDone),
    ).toBeInTheDocument();
    expect(
      screen.getByText(IMMUNIZATION_PROGRESS_COPY.legendMissed),
    ).toBeInTheDocument();
  });
});
