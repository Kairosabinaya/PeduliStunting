import "@/lib/zod-jitless";

import { z } from "zod";

/**
 * Wire shape of GET /api/map/boundaries (an array of `RegionBoundaryDto`).
 * Validated client-side before the rows enter the map feature join, so the
 * fetch boundary never leaks an unchecked cast. `geometry` stays opaque
 * here — `buildMapFeatures` narrows it to a
 * polygonal GeoJSON geometry and skips rows that fail.
 *
 * Kept in its own module (NOT schemas/region.ts, which pulls the whole
 * domain layer) and imported DYNAMICALLY by `MapShell` at fetch time, so
 * Zod stays out of /map's initial bundle and only loads after the deferred
 * map boot.
 */
export const regionBoundariesPayloadSchema = z.array(
  z.object({
    kodeBps: z.string(),
    geometry: z.unknown(),
    simplificationTolerance: z.number().nullable(),
    source: z.string().nullable(),
  }),
);
