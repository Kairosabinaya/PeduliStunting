import type { FittedRegionYearDto } from "@/application/model/use-cases/list-fitted-region-years";
import type {
  IndicatorDefinitionDto,
  RegionDto,
} from "@/application/region/dtos";

import type { SimulatorRegionOption } from "./predictor-simulator";

/**
 * The 20 predictors (rows with a model `displayOrder`) sorted X1..X20 so their
 * array position aligns with the local `beta` / slider `values` arrays.
 */
export function sortSimulatorPredictors(
  dictionary: readonly IndicatorDefinitionDto[],
): readonly IndicatorDefinitionDto[] {
  return dictionary
    .filter((def) => def.model.displayOrder !== null)
    .slice()
    .sort((a, b) => (a.model.displayOrder ?? 0) - (b.model.displayOrder ?? 0));
}

/**
 * Join regions with the set of years the model fitted, keeping only regions
 * that have at least one fit, sorted by province then name for the picker.
 */
export function buildRegionOptions(
  regions: readonly RegionDto[],
  fitted: readonly FittedRegionYearDto[],
): readonly SimulatorRegionOption[] {
  const yearsByKode = new Map<string, Set<number>>();
  for (const fit of fitted) {
    const set = yearsByKode.get(fit.kodeBps) ?? new Set<number>();
    set.add(fit.tahun);
    yearsByKode.set(fit.kodeBps, set);
  }

  const options: SimulatorRegionOption[] = [];
  for (const region of regions) {
    const years = yearsByKode.get(region.kodeBps);
    if (years === undefined || years.size === 0) continue;
    options.push({
      kodeBps: region.kodeBps,
      kabupatenKota: region.kabupatenKota,
      provinsi: region.provinsi,
      years: [...years].sort((a, b) => a - b),
    });
  }
  options.sort(
    (a, b) =>
      a.provinsi.localeCompare(b.provinsi, "id") ||
      a.kabupatenKota.localeCompare(b.kabupatenKota, "id"),
  );
  return options;
}

/** Deterministic initial selection: first option (by sort) at its latest year. */
export function pickInitialSelection(
  options: readonly SimulatorRegionOption[],
): { readonly kodeBps: string; readonly tahun: number } | null {
  const first = options[0];
  if (first === undefined || first.years.length === 0) return null;
  return {
    kodeBps: first.kodeBps,
    tahun: Math.max(...first.years),
  };
}

/**
 * Pick the initial selection, honouring a requested region (its latest fitted
 * year) when that region has a fit. Falls back to {@link pickInitialSelection}
 * when the request is absent or the region is not in the fitted set — so a
 * deep-link from the map (`/prediksi?wilayah=…`) opens on that region, and a
 * stale or unfitted code degrades gracefully instead of showing nothing.
 */
export function pickSelectionForRegion(
  options: readonly SimulatorRegionOption[],
  requestedKodeBps: string | null,
): { readonly kodeBps: string; readonly tahun: number } | null {
  if (requestedKodeBps !== null) {
    const match = options.find((option) => option.kodeBps === requestedKodeBps);
    if (match !== undefined && match.years.length > 0) {
      return { kodeBps: match.kodeBps, tahun: Math.max(...match.years) };
    }
  }
  return pickInitialSelection(options);
}
