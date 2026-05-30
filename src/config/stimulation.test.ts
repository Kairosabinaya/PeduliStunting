import { describe, expect, it } from "vitest";

import { findStimulationGuide, STIMULATION_GUIDES } from "./stimulation";

describe("findStimulationGuide", () => {
  it("returns a guide that overlaps the milestone range", () => {
    const guide = findStimulationGuide(3, 6);
    expect(guide).not.toBeNull();
    expect(guide?.heading).toContain("0-6");
  });

  it("picks the most specific guide when multiple windows overlap", () => {
    const guide = findStimulationGuide(12, 18);
    expect(guide?.heading).toContain("12-18");
  });

  it("returns null when no curated guide covers the range", () => {
    const guide = findStimulationGuide(48, 60);
    expect(guide).toBeNull();
  });

  it("each guide ships at least one stimulation tip", () => {
    for (const guide of STIMULATION_GUIDES) {
      expect(guide.tips.length).toBeGreaterThan(0);
    }
  });
});
