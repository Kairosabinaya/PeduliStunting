import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MILESTONE_ALERT_COPY } from "@/config/tracker";

import { MilestoneAlertBanner } from "./milestone-alert-banner";

describe("MilestoneAlertBanner", () => {
  it("renders nothing when delayedCount is zero", () => {
    const { container } = render(<MilestoneAlertBanner delayedCount={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders alert role with delayed count in the message", () => {
    render(<MilestoneAlertBanner delayedCount={2} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(MILESTONE_ALERT_COPY.bodyFormat(2)),
    ).toBeInTheDocument();
  });

  it("renders a link to the edukasi page", () => {
    render(<MilestoneAlertBanner delayedCount={1} />);
    const link = screen.getByRole("link", {
      name: MILESTONE_ALERT_COPY.ctaLabel,
    });
    expect(link).toHaveAttribute("href", MILESTONE_ALERT_COPY.ctaHref);
  });
});
