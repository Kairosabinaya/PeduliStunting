import {
  buildDashboardDataset,
  type DashboardDatasetDto,
} from "@/application/region/dashboard-dataset";
import {
  toIndicatorDefinitionDto,
  toRegionDto,
  toRegionIndicatorsDto,
} from "@/application/region/dtos";
import type { InsightYearGroup } from "@/application/region/insights";
import { NATIONAL_CONTEXT } from "@/config/national-context";
import type { AppError } from "@/domain/errors/app-error";
import type { IndicatorDictionaryRepository } from "@/domain/region/ports/indicator-dictionary-repository";
import type { RegionRepository } from "@/domain/region/ports/region-repository";
import type { RegionIndicatorsRepository } from "@/domain/region/ports/region-indicators-repository";
import { ok, err, type Result } from "@/domain/shared/result";

/**
 * Assemble the compact, client-shippable dashboard dataset: the full
 * region-year prevalence matrix, the predictor correlation ramp, and the
 * national reference series. Reads regions (names/provinsi/tipe), region
 * indicators for every available year, and the indicator dictionary
 * (predictor correlations), then delegates to the pure
 * {@link buildDashboardDataset}. The presentation layer cross-filters this
 * dataset on the client, so this runs once per request.
 */
export class GetDashboardDatasetUseCase {
  constructor(
    private readonly regionRepo: RegionRepository,
    private readonly regionIndicatorsRepo: RegionIndicatorsRepository,
    private readonly indicatorDictionaryRepo: IndicatorDictionaryRepository,
  ) {}

  async execute(): Promise<Result<DashboardDatasetDto, AppError>> {
    const yearsResult = await this.regionIndicatorsRepo.listAvailableYears();
    if (!yearsResult.ok) return err(yearsResult.error);

    const regionsResult = await this.regionRepo.list();
    if (!regionsResult.ok) return err(regionsResult.error);

    const dictionaryResult = await this.indicatorDictionaryRepo.list();
    if (!dictionaryResult.ok) return err(dictionaryResult.error);

    const yearGroups = await Promise.all(
      yearsResult.value.map(async (tahun) => {
        const result = await this.regionIndicatorsRepo.listByYear(tahun);
        return { tahun, result };
      }),
    );

    const groups: InsightYearGroup[] = [];
    for (const { tahun, result } of yearGroups) {
      if (!result.ok) return err(result.error);
      groups.push({ tahun, rows: result.value.map(toRegionIndicatorsDto) });
    }

    const dataset = buildDashboardDataset(
      regionsResult.value.map(toRegionDto),
      groups,
      dictionaryResult.value.map(toIndicatorDefinitionDto),
      NATIONAL_CONTEXT.nationalPrevalence.map((point) => ({
        tahun: point.tahun,
        prevalence: point.prevalence,
      })),
    );
    return ok(dataset);
  }
}
