import type { Metadata } from "next";

import type { RegionFitDto } from "@/application/model/dtos";
import { PrediksiView } from "@/components/features/dashboard/prediksi-view";
import type { SimulatorRegionOption } from "@/components/features/dashboard/predictor-simulator";
import {
  buildRegionOptions,
  pickSelectionForRegion,
  sortSimulatorPredictors,
} from "@/components/features/dashboard/simulator-data";
import { PREDIKSI_REGION_PARAM } from "@/config/dashboard";
import { makeUseCases } from "@/composition";
import { asModelVersion } from "@/domain/shared/ids";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

export const metadata: Metadata = {
  title: "Simulasi prediksi stunting",
  description:
    "Coba ubah indikator sebuah wilayah dan lihat prediksi model GTWENOLR berubah.",
};

export const dynamic = "force-dynamic";

interface PrediksiPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PrediksiPage({
  searchParams,
}: PrediksiPageProps) {
  const params = await searchParams;
  const rawRegion = params[PREDIKSI_REGION_PARAM];
  const requestedRegion = typeof rawRegion === "string" ? rawRegion : null;

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
    const selection = pickSelectionForRegion(regionOptions, requestedRegion);
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
    <PrediksiView
      predictors={predictors}
      regions={regionOptions}
      etaSign={etaSign}
      initial={initial}
      model={defaultModel}
    />
  );
}
