import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { buildDashboardDataset } from "@/application/region/dashboard-dataset";
import type { RegionDto } from "@/application/region/dtos";
import type {
  DashboardInsightsDto,
  InsightYearGroup,
} from "@/application/region/insights";

import { DASHBOARD_MOVERS, DASHBOARD_TIPE_GAP } from "@/config/dashboard";

import { BaselinesComparison } from "./baselines-comparison";
import { CategoryLegend } from "./category-legend";
import { DashboardFilterProvider } from "./dashboard-filter-context";
import { DashboardFooter } from "./dashboard-footer";
import { KpiCards } from "./kpi-cards";
import { MoversLeaderboard } from "./movers-leaderboard";
import { TipeGapCard } from "./tipe-gap-card";
import { ModelComponents } from "./model-components";
import { ModelEquation } from "./model-equation";
import { ModelPerformance } from "./model-performance";
import { PredictionResult } from "./prediction-result";
import { RegionRankings } from "./region-rankings";
import { SimulatorSection } from "./simulator-section";

const INSIGHTS: DashboardInsightsDto = {
  years: [2023, 2024],
  focusYear: 2024,
  perYear: [
    {
      tahun: 2023,
      meanPrevalence: 24,
      regionCount: 2,
      rendah: 0,
      sedang: 1,
      tinggi: 1,
    },
    {
      tahun: 2024,
      meanPrevalence: 20,
      regionCount: 2,
      rendah: 1,
      sedang: 1,
      tinggi: 0,
    },
  ],
  bestRegions: [
    {
      kodeBps: "3201",
      kabupatenKota: "Bandung",
      provinsi: "Jawa Barat",
      prevalence: 8,
      category: "Rendah",
    },
  ],
  worstRegions: [
    {
      kodeBps: "1101",
      kabupatenKota: "Simeulue",
      provinsi: "Aceh",
      prevalence: 30,
      category: "Tinggi",
    },
  ],
  bestProvinces: [
    { provinsi: "Jawa Barat", meanPrevalence: 8, regionCount: 1 },
  ],
  worstProvinces: [{ provinsi: "Aceh", meanPrevalence: 30, regionCount: 1 }],
};

const METRICS = {
  accuracy: 0.716,
  qwk: 0.696,
  mae: 0.287,
  baselines: {
    OLR: { acc_out: 0.589, qwk_out: 0.53 },
    GTWENOLR_adaptif: { acc_out: 0.716, qwk_out: 0.696 },
  },
};

const KPI_REGIONS: readonly RegionDto[] = [
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
const KPI_GROUPS: readonly InsightYearGroup[] = [
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
const KPI_DATASET = buildDashboardDataset(KPI_REGIONS, KPI_GROUPS, [], []);

describe("KpiCards", () => {
  it("renders the focus-year mean", () => {
    render(
      <DashboardFilterProvider initialYear={2024} initialKodeBps={null}>
        <KpiCards dataset={KPI_DATASET} />
      </DashboardFilterProvider>,
    );
    expect(screen.getByText("20.0%")).toBeInTheDocument();
  });
});

describe("RegionRankings", () => {
  it("lists best and worst regions", () => {
    render(<RegionRankings insights={INSIGHTS} scope="region" />);
    expect(screen.getByText("Bandung")).toBeInTheDocument();
    expect(screen.getByText("Simeulue")).toBeInTheDocument();
  });
});

describe("CategoryLegend", () => {
  it("explains the three categories with their thresholds", () => {
    render(<CategoryLegend />);
    expect(screen.getByText("Cara membaca kategori")).toBeInTheDocument();
    expect(screen.getByText("< 20%")).toBeInTheDocument();
    expect(screen.getByText("≥ 30%")).toBeInTheDocument();
  });
});

describe("TipeGapCard", () => {
  it("shows stacked category bars for Kota and Kabupaten", () => {
    render(
      <TipeGapCard
        kota={{
          label: "Kota",
          rendah: 64,
          sedang: 30,
          tinggi: 4,
          regionCount: 98,
        }}
        kabupaten={{
          label: "Kabupaten",
          rendah: 125,
          sedang: 182,
          tinggi: 109,
          regionCount: 416,
        }}
      />,
    );
    expect(screen.getByText(DASHBOARD_TIPE_GAP.kotaLabel)).toBeInTheDocument();
    expect(
      screen.getByText(DASHBOARD_TIPE_GAP.kabupatenLabel),
    ).toBeInTheDocument();
  });

  it("renders nothing when no data", () => {
    const { container } = render(<TipeGapCard />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("MoversLeaderboard", () => {
  it("lists improvements and declines with before to after values", () => {
    render(
      <MoversLeaderboard
        movers={{
          improvements: [
            {
              kodeBps: "1101",
              kabupatenKota: "Alpha",
              provinsi: "Aceh",
              priorPrevalence: 30,
              focusPrevalence: 22,
              change: -8,
            },
          ],
          declines: [
            {
              kodeBps: "1102",
              kabupatenKota: "Bravo",
              provinsi: "Aceh",
              priorPrevalence: 20,
              focusPrevalence: 21,
              change: 1,
            },
          ],
        }}
      />,
    );
    expect(
      screen.getByText(DASHBOARD_MOVERS.improvedTitle),
    ).toBeInTheDocument();
    expect(
      screen.getByText(DASHBOARD_MOVERS.worsenedTitle),
    ).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("-8.0 poin")).toBeInTheDocument();
  });

  it("renders nothing without movers", () => {
    const { container } = render(<MoversLeaderboard movers={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("ModelPerformance", () => {
  it("renders metric values when present", () => {
    render(<ModelPerformance metrics={METRICS} />);
    expect(screen.getByText("0.716")).toBeInTheDocument();
  });

  it("empty-states when no metrics are numeric", () => {
    render(<ModelPerformance metrics={{}} />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });
});

describe("BaselinesComparison", () => {
  it("highlights the chosen adaptive model", () => {
    render(<BaselinesComparison metrics={METRICS} />);
    expect(screen.getByText("GTWENOLR adaptif")).toBeInTheDocument();
    expect(screen.getByText("Dipakai di sini")).toBeInTheDocument();
  });

  it("empty-states when baselines are absent", () => {
    render(<BaselinesComparison metrics={{}} />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });
});

describe("PredictionResult", () => {
  it("shows predicted class, probabilities, and the observed class", () => {
    render(
      <PredictionResult
        category="Sedang"
        probabilities={{ rendah: 0.1, sedang: 0.6, tinggi: 0.3 }}
        actualCategory="Tinggi"
      />,
    );
    expect(screen.getByTestId("predicted-class")).toHaveTextContent("Sedang");
    // "Tinggi" is both the observed-class chip and the Tinggi bar label.
    expect(screen.getAllByText("Tinggi").length).toBeGreaterThan(0);
    expect(screen.getByText("60.0%")).toBeInTheDocument();
    expect(screen.getAllByRole("progressbar")).toHaveLength(3);
  });
});

describe("ModelEquation and ModelComponents", () => {
  it("render the equation legend and the four prediction steps", () => {
    const { container } = render(<ModelEquation />);
    expect(container.querySelector("dl")).not.toBeNull();
    render(<ModelComponents />);
    expect(screen.getByText("Setarakan tiap indikator")).toBeInTheDocument();
  });
});

describe("DashboardFooter", () => {
  it("cites the data sources", () => {
    render(<DashboardFooter />);
    expect(screen.getByText(/SSGI\/SKI Kemenkes/)).toBeInTheDocument();
    expect(screen.getByText(/BPS RI/)).toBeInTheDocument();
  });
});

describe("SimulatorSection", () => {
  it("empty-states when there is no fitted region", () => {
    render(
      <SimulatorSection
        predictors={[]}
        regions={[]}
        etaSign={1}
        initial={null}
      />,
    );
    expect(
      screen.getByText("Wilayah-tahun ini belum dimodelkan"),
    ).toBeInTheDocument();
  });
});
