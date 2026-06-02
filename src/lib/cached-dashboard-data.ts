import "server-only";

import { unstable_cache } from "next/cache";

import type { ModelMetadataDto, RegionFitDto } from "@/application/model/dtos";
import type { FittedRegionYearDto } from "@/application/model/use-cases/list-fitted-region-years";
import type { DashboardDatasetDto } from "@/application/region/dashboard-dataset";
import type { IndicatorDefinitionDto } from "@/application/region/dtos";
import { makeUseCases } from "@/composition";
import { asModelVersion } from "@/domain/shared/ids";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/server-client";

/**
 * Cross-request cache for the public reference data behind `/data` and
 * `/prediksi`. Mirrors `cached-map-data.ts`: the admin client reads public
 * reference tables (identical for every user) inside `unstable_cache` callbacks
 * that have no cookie context. The data does not change between research
 * re-imports, so the TTL is long; `revalidateTag(...)` (see
 * `/api/revalidate`) refreshes it on demand after a re-import.
 *
 * Each callback THROWS on a domain error so failures are never cached — callers
 * must catch and degrade (preserving the pages' existing resilience).
 */

const WEEK_SECONDS = 60 * 60 * 24 * 7;

async function withUseCases<T>(
  body: (useCases: ReturnType<typeof makeUseCases>) => Promise<T>,
): Promise<T> {
  return body(makeUseCases(createSupabaseAdminClient()));
}

/** Run a cached fetch, degrading to `fallback` if it throws (no cached errors). */
export async function safeCache<T>(
  fetcher: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fetcher();
  } catch {
    return fallback;
  }
}

export const getCachedDashboardDataset = unstable_cache(
  async (): Promise<DashboardDatasetDto> =>
    withUseCases(async (useCases) => {
      const result = await useCases.getDashboardDataset.execute();
      if (!result.ok) throw new Error(result.error.message);
      return result.value;
    }),
  ["dashboard:dataset:v1"],
  { tags: ["dashboard-dataset"], revalidate: WEEK_SECONDS },
);

export const getCachedDefaultModelMetadata = unstable_cache(
  async (): Promise<ModelMetadataDto | null> =>
    withUseCases(async (useCases) => {
      const result = await useCases.getDefaultModelMetadata.execute();
      if (!result.ok) throw new Error(result.error.message);
      return result.value;
    }),
  ["model:default-metadata:v1"],
  { tags: ["model-metadata"], revalidate: WEEK_SECONDS },
);

export const getCachedIndicatorDictionary = unstable_cache(
  async (): Promise<readonly IndicatorDefinitionDto[]> =>
    withUseCases(async (useCases) => {
      const result = await useCases.listIndicatorDictionary.execute();
      if (!result.ok) throw new Error(result.error.message);
      return result.value;
    }),
  ["indicator-dictionary:v1"],
  { tags: ["indicator-dictionary"], revalidate: WEEK_SECONDS },
);

export const getCachedFittedRegionYears = unstable_cache(
  async (version: string): Promise<readonly FittedRegionYearDto[]> =>
    withUseCases(async (useCases) => {
      const result = await useCases.listFittedRegionYears.execute(
        asModelVersion(version),
      );
      if (!result.ok) throw new Error(result.error.message);
      return result.value;
    }),
  ["model:fitted-region-years:v1"],
  { tags: ["model-fits"], revalidate: WEEK_SECONDS },
);

export const getCachedRegionFit = unstable_cache(
  async (
    version: string,
    kodeBps: string,
    tahun: number,
  ): Promise<RegionFitDto | null> =>
    withUseCases(async (useCases) => {
      const result = await useCases.getRegionFit.execute({
        version: asModelVersion(version),
        kodeBps,
        tahun,
      });
      if (!result.ok) throw new Error(result.error.message);
      return result.value;
    }),
  ["model:region-fit:v1"],
  { tags: ["model-fits"], revalidate: WEEK_SECONDS },
);
