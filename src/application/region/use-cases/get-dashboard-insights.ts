import { toRegionDto, toRegionIndicatorsDto } from "@/application/region/dtos";
import {
  buildDashboardInsights,
  type DashboardInsightsDto,
  type InsightYearGroup,
} from "@/application/region/insights";
import { DASHBOARD_INSIGHTS } from "@/config/dashboard";
import type { AppError } from "@/domain/errors/app-error";
import type { RegionRepository } from "@/domain/region/ports/region-repository";
import type { RegionIndicatorsRepository } from "@/domain/region/ports/region-indicators-repository";
import { ok, err, type Result } from "@/domain/shared/result";

/**
 * Assemble the data-insight dataset for the public dashboard: per-year
 * cross-region prevalence means + class counts, and best/worst region and
 * province rankings for the latest year. Reads regions (for names/provinsi) and
 * region indicators for every available year, then delegates the aggregation to
 * the pure {@link buildDashboardInsights}.
 */
export class GetDashboardInsightsUseCase {
  constructor(
    private readonly regionRepo: RegionRepository,
    private readonly regionIndicatorsRepo: RegionIndicatorsRepository,
  ) {}

  async execute(): Promise<Result<DashboardInsightsDto, AppError>> {
    const yearsResult = await this.regionIndicatorsRepo.listAvailableYears();
    if (!yearsResult.ok) return err(yearsResult.error);

    const regionsResult = await this.regionRepo.list();
    if (!regionsResult.ok) return err(regionsResult.error);

    const yearGroups = await Promise.all(
      yearsResult.value.map(async (tahun) => {
        const result = await this.regionIndicatorsRepo.listByYear(tahun);
        return { tahun, result };
      }),
    );

    const groups: InsightYearGroup[] = [];
    for (const { tahun, result } of yearGroups) {
      if (!result.ok) return err(result.error);
      groups.push({
        tahun,
        rows: result.value.map(toRegionIndicatorsDto),
      });
    }

    const insights = buildDashboardInsights(
      regionsResult.value.map(toRegionDto),
      groups,
      {
        rankingLimit: DASHBOARD_INSIGHTS.rankingLimit,
        provinceLimit: DASHBOARD_INSIGHTS.provinceLimit,
        moverLimit: DASHBOARD_INSIGHTS.moverLimit,
      },
    );
    return ok(insights);
  }
}
