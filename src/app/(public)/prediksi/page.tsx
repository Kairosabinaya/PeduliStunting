import type { Metadata } from "next";

import type { RegionFitDto } from "@/application/model/dtos";
import { DashboardFooter } from "@/components/features/dashboard/dashboard-footer";
import { PrediksiView } from "@/components/features/dashboard/prediksi-view";
import type { SimulatorRegionOption } from "@/components/features/dashboard/predictor-simulator";
import {
  buildRegionOptions,
  pickInitialSelection,
  sortSimulatorPredictors,
} from "@/components/features/dashboard/simulator-data";
import { makeUseCases } from "@/composition";
import { asModelVersion } from "@/domain/shared/ids";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

export const metadata: Metadata = {
  title: "Simulasi prediksi stunting",
  description:
    "Coba ubah indikator sebuah wilayah dan lihat prediksi model GTWENOLR berubah.",
};

export const dynamic = "force-dynamic";

export default async function PrediksiPage() {
  const supabase = await createSupabaseServerClient();
  const useCases = makeUseCases(supabase);

  const [defaultModelResult, dictionaryResult, regionsResult] =
    await Promise.all([
      useCases.getDefaultModelMetadata.execute(),
      useCases.listIndicatorDictionary.execute(),
      useCases.listRegions.execute(),
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
    <div className="space-y-8">
      <PrediksiView
        predictors={predictors}
        regions={regionOptions}
        etaSign={etaSign}
        initial={initial}
        model={defaultModel}
      />
      <DashboardFooter />
    </div>
  );
}
