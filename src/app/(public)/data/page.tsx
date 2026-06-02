import type { Metadata } from "next";

import type { DashboardDatasetDto } from "@/application/region/dashboard-dataset";
import { AiChatMount } from "@/components/features/ai/ai-chat-mount";
import { CHOROPLETH } from "@/components/features/landing/scroll-choropleth/choropleth-data";
import { DataView } from "@/components/features/dashboard/data-view";
import { DashboardFooter } from "@/components/features/dashboard/dashboard-footer";
import {
  DASHBOARD_REGION_PARAM,
  DASHBOARD_YEAR_PARAM,
  DEFAULT_DASHBOARD_YEAR,
} from "@/config/dashboard-filter";
import { isSupportedYear, type SupportedYear } from "@/config/years";
import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { err, ok, type Result } from "@/domain/shared/result";
import { getCachedDashboardDataset } from "@/lib/cached-dashboard-data";

export const metadata: Metadata = {
  title: "Potret stunting",
  description:
    "Sebaran, tren, dan indikator stunting kabupaten/kota di Indonesia, 2021-2024.",
};

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DataPage({
  searchParams,
}: {
  readonly searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Cross-request cached (reference data does not change); degrade to an error
  // Result so DataView shows its error state instead of crashing.
  let dataset: Result<DashboardDatasetDto, AppError>;
  try {
    dataset = ok(await getCachedDashboardDataset());
  } catch (cause) {
    dataset = err(
      AppErrors.unexpected(
        "Tidak bisa memuat data dashboard.",
        cause instanceof Error ? cause : undefined,
      ),
    );
  }

  const yearParam = Number(firstParam(params[DASHBOARD_YEAR_PARAM]));
  const initialYear: SupportedYear = isSupportedYear(yearParam)
    ? yearParam
    : DEFAULT_DASHBOARD_YEAR;
  const initialKodeBps = firstParam(params[DASHBOARD_REGION_PARAM]) ?? null;

  // The choropleth path geometry is year-independent; the client recolours it
  // per selected year by joining `kodeBps` against the dataset. Ship geometry
  // only (no severity/prevalence duplication).
  const geometry = {
    viewBox: CHOROPLETH.viewBox,
    paths: CHOROPLETH.paths.map((path) => ({
      kodeBps: path.kodeBps,
      kabupatenKota: path.kabupatenKota,
      d: path.d,
    })),
  };

  return (
    <div className="space-y-8">
      <DataView
        dataset={dataset}
        geometry={geometry}
        initialYear={initialYear}
        initialKodeBps={initialKodeBps}
      />
      <DashboardFooter />
      <AiChatMount
        pageId="data"
        kodeBps={initialKodeBps ?? undefined}
        tahun={initialYear}
      />
    </div>
  );
}
