import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MILESTONE_CARD_COPY } from "@/config/tracker";

import { MilestoneStimulationPanel } from "./milestone-stimulation-panel";

describe("MilestoneStimulationPanel", () => {
  it("renders curated tips when a guide matches the range", () => {
    render(<MilestoneStimulationPanel minAgeMonths={3} maxAgeMonths={6} />);
    expect(
      screen.getByText(MILESTONE_CARD_COPY.stimulationHeading),
    ).toBeInTheDocument();
    expect(screen.getByText(/peluk, cium/i)).toBeInTheDocument();
  });

  it("renders the empty fallback when no guide covers the range", () => {
    render(<MilestoneStimulationPanel minAgeMonths={48} maxAgeMonths={60} />);
    expect(
      screen.getByText(MILESTONE_CARD_COPY.emptyStimulation),
    ).toBeInTheDocument();
  });
});
