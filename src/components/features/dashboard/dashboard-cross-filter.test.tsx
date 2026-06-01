import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { buildDashboardDataset } from "@/application/region/dashboard-dataset";
import type { RegionDto } from "@/application/region/dtos";
import type { InsightYearGroup } from "@/application/region/insights";
import { DASHBOARD_SPOTLIGHT } from "@/config/dashboard";

import type { ChoroplethGeometry } from "./dashboard-choropleth-interactive";
import { DashboardShell } from "./dashboard-shell";

const REGIONS: readonly RegionDto[] = [
  {
    kodeBps: "1101",
    provinsi: "Aceh",
    kabupatenKota: "Alpha",
    tipe: "Kabupaten",
    latitude: null,
    longitude: null,
  },
  {
    kodeBps: "3201",
    provinsi: "Jawa Barat",
    kabupatenKota: "Bravo",
    tipe: "Kota",
    latitude: null,
    longitude: null,
  },
];

const GROUPS: readonly InsightYearGroup[] = [
  {
    tahun: 2023,
    rows: [
      {
        kodeBps: "1101",
        tahun: 2023,
        yCategory: "Tinggi",
        y1Prevalence: 30,
        predictors: {},
      },
      {
        kodeBps: "3201",
        tahun: 2023,
        yCategory: "Sedang",
        y1Prevalence: 18,
        predictors: {},
      },
    ],
  },
  {
    tahun: 2024,
    rows: [
      {
        kodeBps: "1101",
        tahun: 2024,
        yCategory: "Sedang",
        y1Prevalence: 22,
        predictors: {},
      },
      {
        kodeBps: "3201",
        tahun: 2024,
        yCategory: "Rendah",
        y1Prevalence: 18,
        predictors: {},
      },
    ],
  },
];

const DATASET = buildDashboardDataset(
  REGIONS,
  GROUPS,
  [],
  [
    { tahun: 2023, prevalence: 21.5 },
    { tahun: 2024, prevalence: 19.8 },
  ],
);

const GEOMETRY: ChoroplethGeometry = {
  viewBox: { width: 100, height: 60 },
  paths: [
    { kodeBps: "1101", kabupatenKota: "Alpha", d: "M0 0 L1 1 Z" },
    { kodeBps: "3201", kabupatenKota: "Bravo", d: "M2 2 L3 3 Z" },
  ],
};

function renderShell() {
  return render(
    <DashboardShell
      dataset={DATASET}
      geometry={GEOMETRY}
      initialYear={2024}
      initialKodeBps={null}
    />,
  );
}

describe("dashboard cross-filter", () => {
  it("recomputes the national KPI when the year filter changes", () => {
    renderShell();
    expect(screen.getByText("20.0%")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "2023" }));
    expect(screen.getByText("24.0%")).toBeInTheDocument();
  });

  it("selecting a region on the map opens the spotlight and highlights its ranking row", () => {
    const { container } = renderShell();
    expect(screen.queryByText(DASHBOARD_SPOTLIGHT.eyebrow)).toBeNull();
    fireEvent.click(screen.getByLabelText(/^Alpha:/));
    expect(screen.getByText(DASHBOARD_SPOTLIGHT.eyebrow)).toBeInTheDocument();
    expect(container.querySelector('[aria-current="true"]')).not.toBeNull();
  });

  it("clears the selected region from the spotlight", () => {
    renderShell();
    fireEvent.click(screen.getByLabelText(/^Alpha:/));
    expect(screen.getByText(DASHBOARD_SPOTLIGHT.eyebrow)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(DASHBOARD_SPOTLIGHT.closeLabel));
    expect(screen.queryByText(DASHBOARD_SPOTLIGHT.eyebrow)).toBeNull();
  });
});
