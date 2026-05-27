import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { GrowthMeasurementDto } from "@/application/tracking/dtos";
import { MEASUREMENTS_COPY, SD_CLASS_DISPLAY } from "@/config/tracker";

import { MeasurementHistory } from "./measurement-history";

function measurement(
  partial: Partial<GrowthMeasurementDto> & Pick<GrowthMeasurementDto, "id">,
): GrowthMeasurementDto {
  return {
    userId: "user-1",
    childId: "child-1",
    measuredAt: "2026-01-15",
    weightKg: null,
    heightCm: null,
    measuredLying: null,
    headCircumferenceCm: null,
    muacCm: null,
    zScores: {},
    sdClass: {},
    note: null,
    ...partial,
  };
}

describe("MeasurementHistory", () => {
  it("renders the empty state when there are no measurements", () => {
    render(<MeasurementHistory measurements={[]} />);
    expect(screen.getByText(MEASUREMENTS_COPY.emptyTitle)).toBeInTheDocument();
  });

  it("renders rows in reverse-chronological order", () => {
    const rows = [
      measurement({ id: "older", measuredAt: "2025-12-01", weightKg: 6 }),
      measurement({ id: "newest", measuredAt: "2026-02-10", weightKg: 8 }),
      measurement({ id: "middle", measuredAt: "2026-01-15", weightKg: 7 }),
    ];
    const { container } = render(<MeasurementHistory measurements={rows} />);
    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("8 kg");
    expect(items[1]).toHaveTextContent("7 kg");
    expect(items[2]).toHaveTextContent("6 kg");
  });

  it("renders raw values with units when present and '-' otherwise", () => {
    const row = measurement({
      id: "m1",
      weightKg: 8.4,
      heightCm: 72,
      headCircumferenceCm: null,
      muacCm: 13.5,
    });
    render(<MeasurementHistory measurements={[row]} />);
    expect(screen.getByText("8.4 kg")).toBeInTheDocument();
    expect(screen.getByText("72 cm")).toBeInTheDocument();
    expect(screen.getByText("13.5 cm")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders SD-class badges and per-indicator z-score chips", () => {
    const row = measurement({
      id: "m1",
      zScores: { BB_U: -0.45 },
      sdClass: { BB_U: "normal" },
    });
    render(<MeasurementHistory measurements={[row]} />);
    expect(
      screen.getAllByText(SD_CLASS_DISPLAY.normal.label).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("z = -0.45")).toBeInTheDocument();
  });

  it("renders the optional note when present", () => {
    const row = measurement({ id: "m1", note: "Anak tampak rewel" });
    render(<MeasurementHistory measurements={[row]} />);
    expect(screen.getByText("Anak tampak rewel")).toBeInTheDocument();
  });

  it("omits chips entirely when no indicator has a z-score", () => {
    const row = measurement({ id: "m1", weightKg: 8 });
    const { container } = render(<MeasurementHistory measurements={[row]} />);
    const li = within(container).getAllByRole("listitem")[0];
    if (!li) throw new Error("expected at least one measurement listitem");
    expect(li.querySelectorAll("ul li")).toHaveLength(0);
  });
});
