import type { Metadata } from "next";

import type { RegionFitDto } from "@/application/model/dtos";
import { AiChatMount } from "@/components/features/ai/ai-chat-mount";
import { PrediksiView } from "@/components/features/dashboard/prediksi-view";
import type { SimulatorRegionOption } from "@/components/features/dashboard/predictor-simulator";
import {
  buildRegionOptions,
  pickSelectionForRegion,
  sortSimulatorPredictors,
} from "@/components/features/dashboard/simulator-data";
import { PREDIKSI_REGION_PARAM } from "@/config/dashboard";
import {
  getCachedDefaultModelMetadata,
  getCachedFittedRegionYears,
  getCachedIndicatorDictionary,
  getCachedRegionFit,
  safeCache,
} from "@/lib/cached-dashboard-data";
import { getCachedRegions } from "@/lib/cached-map-data";

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

  // Cross-request cached (reference data does not change); degrade to empty on
  // a cache-fetch error so the simulator still renders (matches prior behavior).
  const [defaultModel, dictionary, regionsList] = await Promise.all([
    safeCache(getCachedDefaultModelMetadata, null),
    safeCache(getCachedIndicatorDictionary, []),
    safeCache(getCachedRegions, []),
  ]);

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
    const version = defaultModel.version;
    const fitted = await safeCache(
      () => getCachedFittedRegionYears(version),
      [],
    );
    regionOptions = buildRegionOptions(regionsList, fitted);
    const selection = pickSelectionForRegion(regionOptions, requestedRegion);
    if (selection !== null) {
      const fit = await safeCache(
        () => getCachedRegionFit(version, selection.kodeBps, selection.tahun),
        null,
      );
      if (fit !== null) {
        initial = { ...selection, fit };
      }
    }
  }

  return (
    <>
      <PrediksiView
        predictors={predictors}
        regions={regionOptions}
        etaSign={etaSign}
        initial={initial}
        model={defaultModel}
      />
      <AiChatMount
        pageId="prediksi"
        kodeBps={requestedRegion ?? undefined}
        tahun={initial?.tahun}
      />
    </>
  );
}
