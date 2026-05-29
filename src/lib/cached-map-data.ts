import "server-only";

import { unstable_cache } from "next/cache";

import type { ModelPredictionDto } from "@/application/model/dtos";
import type {
  RegionBoundaryDto,
  RegionDto,
  RegionIndicatorsDto,
} from "@/application/region/dtos";
import { makeUseCases } from "@/composition";
import { asModelVersion, type ModelVersion } from "@/domain/shared/ids";
import { asYear } from "@/domain/region/value-objects/year";
import { MAX_YEAR, type SupportedYear } from "@/config/years";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/server-client";

/**
 * Server-only, cross-request cache for the public-read slices that drive the
 * Map page. Boundaries are the heavyweight payload (~10 MB GeoJSON for 514
 * regions); without a Next.js cache hit, every search-param change re-fetches
 * + re-parses the entire JSON from Supabase, which is what made tahun-toggle
 * and region-click feel sluggish on the client.
 *
 * Tables exposed here are RLS-marked `TO authenticated`, but the cached
 * payload is identical for every user (public reference data). We hit
 * Supabase with the **service-role admin client** because:
 *   1. `unstable_cache` callbacks are server-only and cannot read per-request
 *      session cookies anyway, so the alternative is an unauthenticated anon
 *      client that the RLS policies would reject — leading to silently
 *      empty results (the "Batas wilayah belum tersedia" bug that motivated
 *      this comment).
 *   2. project guidelines §2.12 reserves the admin client for "clearly isolated
 *      server-only admin paths". This module is exactly that: a narrow,
 *      audited surface that returns read-only public data, never user data.
 *   3. The data is shared across all users by design — there is nothing
 *      privileged to leak.
 *
 * Cache tags follow STATE.md §5.2 so a future ingestion script can call
 * `revalidateTag("region-boundaries")` once after re-import without having to
 * track the exact cache key.
 */

interface ModelMetadataSummary {
  readonly version: string;
  readonly name: string;
  readonly isDefault: boolean;
}

async function withUseCases<T>(
  body: (useCases: ReturnType<typeof makeUseCases>) => Promise<T>,
): Promise<T> {
  const supabase = createSupabaseAdminClient();
  const useCases = makeUseCases(supabase);
  return body(useCases);
}

export const getCachedRegions = unstable_cache(
  async (): Promise<readonly RegionDto[]> => {
    return withUseCases(async (useCases) => {
      const result = await useCases.listRegions.execute();
      if (!result.ok) throw new Error(result.error.message);
      return result.value;
    });
  },
  ["map:regions:v3"],
  { tags: ["regions"], revalidate: 60 * 60 * 24 },
);

/**
 * Boundaries (~3 MB simplified GeoJSON) are too large for Next.js's
 * `unstable_cache` (2 MB hard limit; over that, every call emits an
 * unhandledRejection and falls through to a fresh Supabase fetch — the
 * exact source of the "tahun-toggle / region-click feels broken" bug).
 *
 * Switch to a process-scoped Promise cache instead. Lives in Node memory,
 * survives across requests on the same worker, and clears on process
 * restart. Public reference data with no per-user concerns, so sharing
 * across all users in a worker is fine.
 *
 * On error the cached promise is reset so the next caller retries — a
 * stuck rejected promise would lock the route into a permanent error.
 */
let boundariesPromise: Promise<readonly RegionBoundaryDto[]> | null = null;

export function getCachedBoundaries(): Promise<readonly RegionBoundaryDto[]> {
  if (boundariesPromise === null) {
    boundariesPromise = (async () => {
      try {
        return await withUseCases(async (useCases) => {
          const result = await useCases.listRegionBoundaries.execute();
          if (!result.ok) throw new Error(result.error.message);
          return result.value;
        });
      } catch (error) {
        boundariesPromise = null;
        throw error;
      }
    })();
  }
  return boundariesPromise;
}

/** Reset the in-process boundary cache. Call after a re-import. */
export function invalidateBoundariesCache(): void {
  boundariesPromise = null;
}

/**
 * Derive a tight Indonesia bounding box from `regions.latitude/longitude`.
 * Used by MapCanvas to set the default camera framing and the snap-back
 * target — more accurate than a hand-tuned constant because it adapts to
 * the live dataset (e.g. future pemekaran extends Papua eastward, etc.).
 *
 * Returned as `[[west, south], [east, north]]` to match the order MapLibre's
 * `fitBounds` consumes.
 */
let boundsPromise: Promise<
  readonly [readonly [number, number], readonly [number, number]]
> | null = null;

export function getCachedRegionsBounds(): Promise<
  readonly [readonly [number, number], readonly [number, number]]
> {
  if (boundsPromise === null) {
    boundsPromise = (async () => {
      try {
        const regions = await getCachedRegions();
        const lons: number[] = [];
        const lats: number[] = [];
        for (const r of regions) {
          if (typeof r.longitude === "number" && Number.isFinite(r.longitude)) {
            lons.push(r.longitude);
          }
          if (typeof r.latitude === "number" && Number.isFinite(r.latitude)) {
            lats.push(r.latitude);
          }
        }
        if (lons.length === 0 || lats.length === 0) {
          // Fallback to a conservative Indonesia bbox when coordinates are
          // missing (fresh DB before the import scripts have run).
          return [
            [94.5, -11.5],
            [141.5, 6.5],
          ] as const;
        }
        // ~5% padding on each axis so edge islands have breathing room and
        // the snap-back animation never lands with content kissing the
        // viewport border.
        const padLon = 0.5;
        const padLat = 0.3;
        return [
          [Math.min(...lons) - padLon, Math.min(...lats) - padLat],
          [Math.max(...lons) + padLon, Math.max(...lats) + padLat],
        ] as const;
      } catch (error) {
        boundsPromise = null;
        throw error;
      }
    })();
  }
  return boundsPromise;
}

export const getCachedIndicatorsByYear = unstable_cache(
  async (tahun: SupportedYear): Promise<readonly RegionIndicatorsDto[]> => {
    return withUseCases(async (useCases) => {
      const result = await useCases.listRegionIndicatorsByYear.execute(
        asYear(tahun),
      );
      if (!result.ok) throw new Error(result.error.message);
      return result.value;
    });
  },
  ["map:indicators-by-year:v3"],
  { tags: ["region-indicators"], revalidate: 60 * 60 },
);

export const getCachedDefaultModel = unstable_cache(
  async (): Promise<ModelMetadataSummary | null> => {
    return withUseCases(async (useCases) => {
      const result = await useCases.getDefaultModelMetadata.execute();
      if (!result.ok) throw new Error(result.error.message);
      const meta = result.value;
      if (!meta) return null;
      return {
        version: meta.version,
        name: meta.name,
        isDefault: meta.isDefault,
      };
    });
  },
  ["map:default-model:v3"],
  { tags: ["model-metadata"], revalidate: 60 * 60 },
);

/**
 * Lightweight dataset for the unauthenticated landing-before-login surface
 * at `/map`. Returns only what is needed to render the choropleth as a
 * decorative background: regions, boundaries, the tight Indonesia bbox, and
 * indicators for the latest available year. Predictions and historical years
 * are intentionally omitted — they belong to the interactive variant.
 *
 * Composes the existing cache layer (`getCachedRegions`,
 * `getCachedBoundaries`, `getCachedRegionsBounds`, `getCachedIndicatorsByYear`)
 * so warming this entry warms the interactive entry too and vice versa.
 */
export async function getCachedLandingMapData(): Promise<{
  readonly regions: readonly RegionDto[];
  readonly boundaries: readonly RegionBoundaryDto[];
  readonly bounds: readonly [
    readonly [number, number],
    readonly [number, number],
  ];
  readonly indicators: readonly RegionIndicatorsDto[];
  readonly year: SupportedYear;
}> {
  const [regions, boundaries, bounds, indicators] = await Promise.all([
    getCachedRegions(),
    getCachedBoundaries(),
    getCachedRegionsBounds(),
    getCachedIndicatorsByYear(MAX_YEAR),
  ]);
  return { regions, boundaries, bounds, indicators, year: MAX_YEAR };
}

export const getCachedPredictionsByYear = unstable_cache(
  async (
    version: string,
    tahun: SupportedYear,
  ): Promise<readonly ModelPredictionDto[]> => {
    return withUseCases(async (useCases) => {
      const result = await useCases.listPredictionsByYear.execute(
        asModelVersion(version) as ModelVersion,
        asYear(tahun),
      );
      if (!result.ok) throw new Error(result.error.message);
      return result.value;
    });
  },
  ["map:predictions-by-year:v3"],
  { tags: ["model-predictions"], revalidate: 60 * 60 },
);
