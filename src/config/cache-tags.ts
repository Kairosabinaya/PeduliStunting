/**
 * Cache tags for the public reference data served via `unstable_cache`
 * (`src/lib/cached-map-data.ts`, `src/lib/cached-dashboard-data.ts`). The data
 * is static between research re-imports; `POST /api/revalidate` calls
 * `revalidateTag` for every tag here to refresh all caches at once.
 *
 * Keep the string values in sync with the `tags:` arrays in the cached modules.
 */
export const CACHE_TAGS = {
  regions: "regions",
  regionIndicators: "region-indicators",
  modelMetadata: "model-metadata",
  modelPredictions: "model-predictions",
  modelFits: "model-fits",
  dashboardDataset: "dashboard-dataset",
  indicatorDictionary: "indicator-dictionary",
} as const;

/** All public-data tags, for bulk revalidation after a re-import. */
export const DATA_CACHE_TAGS: readonly string[] = Object.values(CACHE_TAGS);
