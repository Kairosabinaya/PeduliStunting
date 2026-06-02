import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RegionFitDto } from "@/application/model/dtos";
import type { IndicatorDefinitionDto } from "@/application/region/dtos";
import type { PredictorModelMeta } from "@/domain/region/entities/indicator-definition";

import { loadRegionFit } from "@/app/(public)/prediksi/actions";
import { DASHBOARD_SIMULATOR } from "@/config/dashboard";

import {
  PredictorSimulator,
  type SimulatorRegionOption,
} from "./predictor-simulator";

vi.mock("@/app/(public)/prediksi/actions", () => ({
  loadRegionFit: vi.fn(),
}));

// The equation card dynamic-imports KaTeX; keep it cheap in tests.
vi.mock("katex", () => ({
  default: { renderToString: (tex: string) => `<span>${tex}</span>` },
}));

const loadRegionFitMock = vi.mocked(loadRegionFit);

function model(
  displayOrder: number,
  dimension: PredictorModelMeta["modelDimension"],
): PredictorModelMeta {
  return {
    transform: "none",
    stdMean: 0,
    stdSd: 1,
    origMin: 0,
    origMax: 10,
    origP5: null,
    origP50: null,
    origP95: null,
    pctActive: null,
    pctPositive: null,
    medianCoef: null,
    corPrevalence: null,
    modelDimension: dimension,
    displayOrder,
  };
}

function predictor(
  code: string,
  name: string,
  displayOrder: number,
): IndicatorDefinitionDto {
  return {
    code,
    dimension: "socioeconomic",
    name,
    description: null,
    unit: null,
    sourceLabel: null,
    sourceUrl: null,
    effectDirection: null,
    model: model(displayOrder, "Sosial-Ekonomi"),
  };
}

const PREDICTORS: readonly IndicatorDefinitionDto[] = [
  predictor("X1", "Kemiskinan", 1),
  predictor("X2", "Sekolah", 2),
];

const REGIONS: readonly SimulatorRegionOption[] = [
  {
    kodeBps: "1101",
    kabupatenKota: "Simeulue",
    provinsi: "Aceh",
    years: [2023, 2024],
  },
  {
    kodeBps: "3201",
    kabupatenKota: "Bandung",
    provinsi: "Jawa Barat",
    years: [2024],
  },
];

const INITIAL_FIT: RegionFitDto = {
  modelVersion: "gtwenolr-adaptif-1.0",
  kodeBps: "1101",
  kabupatenKota: "Simeulue",
  provinsi: "Aceh",
  tahun: 2024,
  alfa1: -1,
  alfa2: 1,
  nActive: 1,
  converged: true,
  beta: [0.5, 0],
  defaults: [5, 10],
  actualCategory: "Sedang",
  observed: { rendah: 0.2, sedang: 0.5, tinggi: 0.3 },
};

function renderSimulator() {
  return render(
    <PredictorSimulator
      eyebrow="Simulasi"
      title="Simulasi prediksi stunting"
      description="Geser indikator wilayah, lihat prediksinya berubah."
      generalEquation={<span>persamaan umum</span>}
      predictors={PREDICTORS}
      etaSign={1}
      regions={REGIONS}
      initial={{ kodeBps: "1101", tahun: 2024, fit: INITIAL_FIT }}
    />,
  );
}

describe("PredictorSimulator", () => {
  beforeEach(() => {
    loadRegionFitMock.mockReset();
  });

  it("predicts the class from the initial region defaults", () => {
    renderSimulator();
    // eta = 0.5 * 5 = 2.5; sigmoid(-1+2.5) dominates -> Rendah.
    expect(screen.getByTestId("predicted-class")).toHaveTextContent("Rendah");
  });

  it("recomputes the class live when a slider moves", () => {
    renderSimulator();
    const slider = screen.getByRole("slider", { name: /Kemiskinan/ });
    fireEvent.change(slider, { target: { value: "0" } });
    // eta = 0 -> probabilities centre on Sedang.
    expect(screen.getByTestId("predicted-class")).toHaveTextContent("Sedang");
  });

  it("disables selected-out predictors and marks them inactive", () => {
    renderSimulator();
    const inactive = screen.getByRole("slider", { name: /Sekolah/ });
    expect(inactive).toBeDisabled();
    expect(screen.getByText(/Tidak dipakai/)).toBeInTheDocument();
  });

  it("resets slider values to the region defaults", () => {
    renderSimulator();
    const slider = screen.getByRole("slider", { name: /Kemiskinan/ });
    fireEvent.change(slider, { target: { value: "0" } });
    const reset = screen.getByRole("button", {
      name: new RegExp(DASHBOARD_SIMULATOR.resetLabel, "i"),
    });
    expect(reset).toBeEnabled();
    fireEvent.click(reset);
    expect(screen.getByTestId("predicted-class")).toHaveTextContent("Rendah");
  });

  it("loads a new region fit via the server action on region change", async () => {
    loadRegionFitMock.mockResolvedValue({
      ok: true,
      fit: { ...INITIAL_FIT, kodeBps: "3201", kabupatenKota: "Bandung" },
    });
    renderSimulator();
    // Open the searchable region combobox, then pick "Bandung".
    fireEvent.click(screen.getByRole("button", { name: /pilih wilayah/i }));
    fireEvent.click(screen.getByRole("button", { name: "Bandung" }));
    await waitFor(() => {
      expect(loadRegionFitMock).toHaveBeenCalledWith({
        kodeBps: "3201",
        tahun: 2024,
      });
    });
  });
});
