import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ModelPredictionDto } from "@/application/model/dtos";
import type {
  RegionDto,
  RegionIndicatorsDto,
} from "@/application/region/dtos";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { RegionDetailPanel } from "./region-detail-panel";

const region: RegionDto = {
  kodeBps: "1101",
  provinsi: "Aceh",
  kabupatenKota: "Kab. Simeulue",
  tipe: "Kabupaten",
  latitude: 2.6,
  longitude: 96.1,
};

const indicator2024: RegionIndicatorsDto = {
  kodeBps: "1101",
  tahun: 2024,
  yCategory: "Sedang",
  y1Prevalence: 22.5,
  predictors: {},
};

const indicator2023: RegionIndicatorsDto = {
  ...indicator2024,
  tahun: 2023,
  yCategory: "Rendah",
  y1Prevalence: 15.0,
};

const prediction2024: ModelPredictionDto = {
  modelVersion: "gtwenolr-adaptive-1.0",
  kodeBps: "1101",
  tahun: 2024,
  predictedCategory: "Tinggi",
  probRendah: 0.05,
  probSedang: 0.25,
  probTinggi: 0.7,
};

describe("RegionDetailPanel", () => {
  it("renders the empty state when no region is selected", () => {
    render(
      <RegionDetailPanel
        region={null}
        tahun={2024}
        source="actual"
        currentIndicator={null}
        currentPrediction={null}
        history={[]}
        predictionHistory={[]}
        currentSearch=""
      />,
    );
    expect(screen.getByText(/belum ada wilayah dipilih/i)).toBeInTheDocument();
  });

  it("shows the region header and a close link that drops the selection param", () => {
    render(
      <RegionDetailPanel
        region={region}
        tahun={2024}
        source="actual"
        currentIndicator={indicator2024}
        currentPrediction={prediction2024}
        history={[indicator2023, indicator2024]}
        predictionHistory={[prediction2024]}
        currentSearch="tahun=2024&sumber=actual&wilayah=1101"
      />,
    );
    expect(
      screen.getByRole("heading", { name: /kab\. simeulue/i }),
    ).toBeInTheDocument();
    const close = screen.getByRole("link", { name: /tutup detail wilayah/i });
    expect(close).toHaveAttribute("href", "?tahun=2024&sumber=actual");
  });

  it("falls back to '?' close href when removing selection leaves no params", () => {
    render(
      <RegionDetailPanel
        region={region}
        tahun={2024}
        source="actual"
        currentIndicator={null}
        currentPrediction={null}
        history={[]}
        predictionHistory={[]}
        currentSearch="wilayah=1101"
      />,
    );
    const close = screen.getByRole("link", { name: /tutup detail wilayah/i });
    expect(close).toHaveAttribute("href", "?");
  });

  it("renders both observed and predicted categories as badges", () => {
    render(
      <RegionDetailPanel
        region={region}
        tahun={2024}
        source="actual"
        currentIndicator={indicator2024}
        currentPrediction={prediction2024}
        history={[indicator2024]}
        predictionHistory={[prediction2024]}
        currentSearch="tahun=2024"
      />,
    );
    const obsMetric = screen
      .getByText(/kategori observasi 2024/i)
      .parentElement;
    if (!obsMetric) throw new Error("observation metric has no parent");
    expect(within(obsMetric).getByText("Sedang")).toBeInTheDocument();
    const predMetric = screen
      .getByText(/kategori prediksi 2024/i)
      .parentElement;
    if (!predMetric) throw new Error("prediction metric has no parent");
    expect(within(predMetric).getByText("Tinggi")).toBeInTheDocument();
  });

  it("renders probability bars only when the source is predicted", () => {
    const { rerender } = render(
      <RegionDetailPanel
        region={region}
        tahun={2024}
        source="actual"
        currentIndicator={indicator2024}
        currentPrediction={prediction2024}
        history={[indicator2024]}
        predictionHistory={[prediction2024]}
        currentSearch=""
      />,
    );
    expect(screen.queryByText(/probabilitas model/i)).not.toBeInTheDocument();

    rerender(
      <RegionDetailPanel
        region={region}
        tahun={2024}
        source="predicted"
        currentIndicator={indicator2024}
        currentPrediction={prediction2024}
        history={[indicator2024]}
        predictionHistory={[prediction2024]}
        currentSearch=""
      />,
    );
    expect(screen.getByText(/probabilitas model/i)).toBeInTheDocument();
    const tinggiBar = screen.getByRole("progressbar", {
      name: /probabilitas tinggi/i,
    });
    expect(tinggiBar).toHaveAttribute("aria-valuenow", "70");
  });

  it("renders one history row per year that has data, ordered chronologically", () => {
    render(
      <RegionDetailPanel
        region={region}
        tahun={2024}
        source="actual"
        currentIndicator={indicator2024}
        currentPrediction={prediction2024}
        history={[indicator2024, indicator2023]}
        predictionHistory={[prediction2024]}
        currentSearch=""
      />,
    );
    const yearCells = screen.getAllByText(/^(2021|2022|2023|2024)$/);
    expect(yearCells.map((node) => node.textContent)).toEqual(["2023", "2024"]);
  });

  it("falls back to 'Tidak tersedia' when prevalence is null", () => {
    render(
      <RegionDetailPanel
        region={region}
        tahun={2024}
        source="actual"
        currentIndicator={{ ...indicator2024, y1Prevalence: null }}
        currentPrediction={null}
        history={[]}
        predictionHistory={[]}
        currentSearch=""
      />,
    );
    const prevMetric = screen.getByText(/prevalensi \(y1\)/i).parentElement;
    if (!prevMetric) throw new Error("prevalence metric has no parent");
    expect(within(prevMetric).getByText("Tidak tersedia")).toBeInTheDocument();
  });
});
