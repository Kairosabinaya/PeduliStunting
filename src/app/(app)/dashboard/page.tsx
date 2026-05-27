import type { Metadata } from "next";

import {
  summariseCoefficients,
  type CoefficientSummaryDto,
} from "@/application/model/dtos";
import { MetricsSnapshot } from "@/components/features/dashboard/metrics-snapshot";
import { ModelComparisonTable } from "@/components/features/dashboard/model-comparison-table";
import { MoranChart } from "@/components/features/dashboard/moran-chart";
import { PredictorContribution } from "@/components/features/dashboard/predictor-contribution";
import { PredictorDictionary } from "@/components/features/dashboard/predictor-dictionary";
import { WhatIfSection } from "@/components/features/dashboard/what-if-section";
import { PageHeader } from "@/components/primitives/page-header";
import { makeUseCases } from "@/composition";
import { DASHBOARD_HEADER } from "@/config/dashboard";
import type { AppError } from "@/domain/errors/app-error";
import { asModelVersion } from "@/domain/shared/ids";
import { ok, type Result } from "@/domain/shared/result";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const useCases = makeUseCases(supabase);

  const [defaultModelResult, dictionaryResult] = await Promise.all([
    useCases.getDefaultModelMetadata.execute(),
    useCases.listIndicatorDictionary.execute(),
  ]);

  const defaultVersion =
    defaultModelResult.ok && defaultModelResult.value
      ? defaultModelResult.value.version
      : null;

  const coefficientResult: Result<CoefficientSummaryDto, AppError> =
    defaultVersion === null
      ? ok(summariseCoefficients("", null, []))
      : await useCases.getCoefficientSummary.execute({
          version: asModelVersion(defaultVersion),
        });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={DASHBOARD_HEADER.eyebrow}
        title={DASHBOARD_HEADER.title}
        description={DASHBOARD_HEADER.description}
      />
      <MetricsSnapshot result={defaultModelResult} />
      <ModelComparisonTable result={defaultModelResult} />
      <MoranChart result={defaultModelResult} />
      <PredictorDictionary result={dictionaryResult} />
      <PredictorContribution result={dictionaryResult} />
      <WhatIfSection
        coefficients={coefficientResult}
        dictionary={dictionaryResult}
      />
    </div>
  );
}
