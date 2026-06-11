import { NextResponse } from "next/server";

import { MAP_BOUNDARIES_CACHE_CONTROL } from "@/config/map";
import { AppErrors, appErrorToHttpStatus } from "@/domain/errors/app-error";
import { getCachedBoundaries } from "@/lib/cached-map-data";

/**
 * GET /api/map/boundaries — the simplified kabupaten/kota boundary rows
 * consumed by the deferred map boot on /map.
 *
 * The payload is anon-readable reference data (RLS PUB-R) that only changes
 * on a manual re-import, so it is served from the long-lived server cache
 * (`getCachedBoundaries`) with an aggressive browser/CDN cache policy.
 * Moving geometry here (instead of inlining it once per year in the RSC
 * flight payload) is what shrank the /map document from ~1 MB transferred
 * to a few KB.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const boundaries = await getCachedBoundaries();
    return NextResponse.json(boundaries, {
      headers: { "Cache-Control": MAP_BOUNDARIES_CACHE_CONTROL },
    });
  } catch (cause) {
    const error = AppErrors.externalService(
      "Batas wilayah belum bisa dimuat. Coba lagi sebentar lagi.",
      "supabase",
      cause,
    );
    return NextResponse.json(
      { ok: false, error },
      { status: appErrorToHttpStatus(error) },
    );
  }
}
