import type { Metadata } from "next";

import { AiChatMount } from "@/components/features/ai/ai-chat-mount";
import { CHOROPLETH } from "@/components/features/landing/scroll-choropleth/choropleth-data";
import { DataView } from "@/components/features/dashboard/data-view";
import { DashboardFooter } from "@/components/features/dashboard/dashboard-footer";
import { makeUseCases } from "@/composition";
import {
  DASHBOARD_REGION_PARAM,
  DASHBOARD_YEAR_PARAM,
  DEFAULT_DASHBOARD_YEAR,
} from "@/config/dashboard-filter";
import { isSupportedYear, type SupportedYear } from "@/config/years";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

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
  const supabase = await createSupabaseServerClient();
  const useCases = makeUseCases(supabase);
  const dataset = await useCases.getDashboardDataset.execute();

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
