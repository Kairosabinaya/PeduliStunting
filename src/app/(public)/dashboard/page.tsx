import type { Metadata } from "next";

import type { RegionFitDto } from "@/application/model/dtos";
import { DashboardFooter } from "@/components/features/dashboard/dashboard-footer";
import { DashboardTabs } from "@/components/features/dashboard/dashboard-tabs";
import { InsightSection } from "@/components/features/dashboard/insight-section";
import { ModelSection } from "@/components/features/dashboard/model-section";
import { SimulatorSection } from "@/components/features/dashboard/simulator-section";
import {
  buildRegionOptions,
  pickInitialSelection,
  sortSimulatorPredictors,
} from "@/components/features/dashboard/simulator-data";
import type { SimulatorRegionOption } from "@/components/features/dashboard/predictor-simulator";
import { PageHeader } from "@/components/primitives/page-header";
import { makeUseCases } from "@/composition";
import { DASHBOARD_HEADER } from "@/config/dashboard";
import { asModelVersion } from "@/domain/shared/ids";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

export const metadata: Metadata = {
  title: "Dashboard stunting",
  description:
    "Insight prevalensi stunting kabupaten/kota, penjelasan model GTWENOLR, dan prediktor interaktif.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const useCases = makeUseCases(supabase);

  const [defaultModelResult, dictionaryResult, regionsResult, insightsResult] =
    await Promise.all([
      useCases.getDefaultModelMetadata.execute(),
      useCases.listIndicatorDictionary.execute(),
      useCases.listRegions.execute(),
      useCases.getDashboardInsights.execute(),
    ]);

  const defaultModel = defaultModelResult.ok ? defaultModelResult.value : null;
  const dictionary = dictionaryResult.ok ? dictionaryResult.value : [];
  const regionsList = regionsResult.ok ? regionsResult.value : [];

  const predictors = sortSimulatorPredictors(dictionary);
  let regionOptions: readonly SimulatorRegionOption[] = [];
  let etaSign = 1;
  let initial: {
    readonly kodeBps: string;
    readonly tahun: number;
    readonly fit: RegionFitDto;
  } | null = null;

  if (defaultModel !== null) {
    etaSign = defaultModel.etaSign;
    const version = asModelVersion(defaultModel.version);
    const fittedResult = await useCases.listFittedRegionYears.execute(version);
    const fitted = fittedResult.ok ? fittedResult.value : [];
    regionOptions = buildRegionOptions(regionsList, fitted);
    const selection = pickInitialSelection(regionOptions);
    if (selection !== null) {
      const fitResult = await useCases.getRegionFit.execute({
        version,
        kodeBps: selection.kodeBps,
        tahun: selection.tahun,
      });
      if (fitResult.ok && fitResult.value !== null) {
        initial = { ...selection, fit: fitResult.value };
      }
    }
  }

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow={DASHBOARD_HEADER.eyebrow}
        title={DASHBOARD_HEADER.title}
        description={DASHBOARD_HEADER.description}
      />
      <DashboardTabs
        insight={
          <InsightSection insights={insightsResult} predictors={predictors} />
        }
        model={<ModelSection model={defaultModel} />}
        simulator={
          <SimulatorSection
            predictors={predictors}
            regions={regionOptions}
            etaSign={etaSign}
            initial={initial}
          />
        }
      />
      <DashboardFooter />
    </div>
  );
}
