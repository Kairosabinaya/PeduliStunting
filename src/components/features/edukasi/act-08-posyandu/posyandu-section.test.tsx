import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { POSYANDU_COPY } from "@/config/edukasi";
import { POSYANDU_SERVICES } from "@/data/edukasi/posyandu";

import { PosyanduSection } from "./posyandu-section";

describe("PosyanduSection", () => {
  it("renders every service title in the timeline", () => {
    render(<PosyanduSection />);
    // Each title renders in both the desktop and the mobile timeline (one of
    // which is CSS-hidden at runtime), so assert at least one heading per
    // service rather than a unique match.
    POSYANDU_SERVICES.forEach((service) => {
      expect(
        screen.getAllByRole("heading", { name: service.title }).length,
      ).toBeGreaterThan(0);
    });
  });

  it("renders the immunization schedule modal launcher", () => {
    render(<PosyanduSection />);
    expect(
      screen.getByRole("button", { name: POSYANDU_COPY.scheduleAriaLabel }),
    ).toBeInTheDocument();
  });
});
