import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { GrowthMeasurementDto } from "@/application/tracking/dtos";
import { FUN_SIZE_COPY } from "@/config/tracker";

import { FunSizeCard } from "./fun-size-card";

function makeMeasurement(
  overrides: Partial<GrowthMeasurementDto> = {},
): GrowthMeasurementDto {
  return {
    id: "m-1",
    userId: "u-1",
    childId: "c-1",
    measuredAt: "2026-03-01",
    weightKg: 9.5,
    heightCm: 75,
    measuredLying: false,
    headCircumferenceCm: null,
    muacCm: null,
    zScores: {},
    sdClass: {},
    note: null,
    ...overrides,
  };
}

describe("FunSizeCard", () => {
  it("renders empty state when no measurement is supplied", () => {
    render(<FunSizeCard latest={null} />);
    expect(screen.getByText(FUN_SIZE_COPY.emptyState)).toBeInTheDocument();
  });

  it("renders both weight and height comparisons", () => {
    render(<FunSizeCard latest={makeMeasurement()} />);
    expect(screen.getByText(/berat 9\.5 kg/i)).toBeInTheDocument();
    expect(screen.getByText(/tinggi 75\.0 cm/i)).toBeInTheDocument();
  });

  it("renders only weight when height is missing", () => {
    render(<FunSizeCard latest={makeMeasurement({ heightCm: null })} />);
    expect(screen.getByText(/berat 9\.5 kg/i)).toBeInTheDocument();
    expect(screen.queryByText(/tinggi/i)).not.toBeInTheDocument();
  });
});
