import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { GrowthMeasurementDto } from "@/application/tracking/dtos";
import {
  CHILD_DETAIL_COPY,
  GROWTH_INDICATOR_LABEL,
  SD_CLASS_DISPLAY,
} from "@/config/tracker";

import { ChildSummary } from "./child-summary";

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

describe("ChildSummary", () => {
  it("renders the empty state when there are no measurements", () => {
    render(<ChildSummary measurements={[]} />);
    expect(
      screen.getByText(CHILD_DETAIL_COPY.noMeasurementYet),
    ).toBeInTheDocument();
  });

  it("renders the empty state when no measurement has a finite z-score", () => {
    render(
      <ChildSummary
        measurements={[
          measurement({ id: "m1", weightKg: 8, zScores: {}, sdClass: {} }),
        ]}
      />,
    );
    expect(
      screen.getByText(CHILD_DETAIL_COPY.noMeasurementYet),
    ).toBeInTheDocument();
  });

  it("renders the most recent z-score per indicator", () => {
    const older = measurement({
      id: "m-old",
      measuredAt: "2025-12-01",
      zScores: { BB_U: -2.5 },
      sdClass: { BB_U: "kurang" },
    });
    const newer = measurement({
      id: "m-new",
      measuredAt: "2026-02-10",
      zScores: { BB_U: -1.1, TB_U: -3.4 },
      sdClass: { BB_U: "normal", TB_U: "sangat_pendek" },
    });

    render(<ChildSummary measurements={[older, newer]} />);

    expect(screen.getByText("-1.10")).toBeInTheDocument();
    expect(screen.getByText("-3.40")).toBeInTheDocument();
    expect(screen.getByText(GROWTH_INDICATOR_LABEL.BB_U)).toBeInTheDocument();
    expect(screen.getByText(GROWTH_INDICATOR_LABEL.TB_U)).toBeInTheDocument();
    expect(screen.getByText(SD_CLASS_DISPLAY.normal.label)).toBeInTheDocument();
    expect(
      screen.getByText(SD_CLASS_DISPLAY.sangat_pendek.label),
    ).toBeInTheDocument();
  });

  it("falls back to an older measurement when the newest skipped the indicator", () => {
    const older = measurement({
      id: "m-old",
      measuredAt: "2025-12-01",
      zScores: { LK_U: 0.2 },
      sdClass: { LK_U: "normal" },
    });
    const newer = measurement({
      id: "m-new",
      measuredAt: "2026-02-10",
      zScores: { BB_U: -1 },
      sdClass: { BB_U: "normal" },
    });
    render(<ChildSummary measurements={[older, newer]} />);
    expect(screen.getByText("0.20")).toBeInTheDocument();
  });
});
