import type { IndicatorDefinitionDto } from "@/application/region/dtos";
import type { DashboardInsightsDto } from "@/application/region/insights";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import {
  DASHBOARD_ANALYSIS,
  DASHBOARD_KPI,
  DASHBOARD_SECTIONS,
  DASHBOARD_TREND,
} from "@/config/dashboard";
import { NATIONAL_CONTEXT } from "@/config/national-context";
import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";

import { DashboardChoropleth } from "./dashboard-choropleth";
import { DashboardSection } from "./dashboard-section";
import { KpiCards } from "./kpi-cards";
import { PredictorAnalysis } from "./predictor-analysis";
import {
  PrevalenceTrendChart,
  type TrendPoint,
} from "./prevalence-trend-chart";
import { RegionRankings } from "./region-rankings";

export interface InsightSectionProps {
  readonly insights: Result<DashboardInsightsDto, AppError>;
  readonly predictors: readonly IndicatorDefinitionDto[];
}

function buildTrendPoints(
  insights: DashboardInsightsDto,
): readonly TrendPoint[] {
  const nationalByYear = new Map<number, number>(
    NATIONAL_CONTEXT.nationalPrevalence.map((p) => [p.tahun, p.prevalence]),
  );
  return insights.perYear.map((point) => ({
    tahun: point.tahun,
    crossRegion: point.meanPrevalence,
    national: nationalByYear.get(point.tahun) ?? null,
  }));
}

export function InsightSection({ insights, predictors }: InsightSectionProps) {
  return (
    <DashboardSection description={DASHBOARD_SECTIONS.insight.description}>
      {!insights.ok ? (
        <ErrorState
          title={DASHBOARD_KPI.errorTitle}
          description={insights.error.message}
        />
      ) : insights.value.perYear.length === 0 ? (
        <EmptyState
          title={DASHBOARD_KPI.emptyTitle}
          description={DASHBOARD_KPI.emptyDescription}
        />
      ) : (
        <div className="space-y-6">
          <KpiCards insights={insights.value} />
          <DashboardChoropleth />
          <Card>
            <CardHeader>
              <CardTitle>{DASHBOARD_TREND.title}</CardTitle>
              <CardDescription>{DASHBOARD_TREND.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <PrevalenceTrendChart points={buildTrendPoints(insights.value)} />
            </CardContent>
          </Card>
          <RegionRankings insights={insights.value} />
          <Card>
            <CardHeader>
              <CardTitle>{DASHBOARD_ANALYSIS.title}</CardTitle>
              <CardDescription>
                {DASHBOARD_ANALYSIS.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PredictorAnalysis predictors={predictors} />
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardSection>
  );
}
