/**
 * GET /api/region/[kodeBps]/history
 *
 * Returns observed indicators + model predictions across all years for a
 * single kabupaten/kota. Used by the client-side detail panel so opening
 * the panel is instant (basic data from already-loaded features) and the
 * chart loads asynchronously without an RSC roundtrip.
 *
 * Auth: session-bound Supabase client. RLS `TO authenticated` covers the
 * public-read tables we touch here.
 */

import { NextResponse, type NextRequest } from "next/server";

import type { ModelPredictionDto } from "@/application/model/dtos";
import type { RegionIndicatorsDto } from "@/application/region/dtos";
import { makeUseCases } from "@/composition";
import { isKodeBps, asKodeBps } from "@/domain/region/value-objects/kode-bps";
import { asModelVersion } from "@/domain/shared/ids";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { getCachedDefaultModel } from "@/lib/cached-map-data";

export const dynamic = "force-dynamic";

export interface RegionHistoryResponse {
  readonly kodeBps: string;
  readonly history: readonly RegionIndicatorsDto[];
  readonly predictionHistory: readonly ModelPredictionDto[];
}

interface RouteParams {
  readonly params: Promise<{ kodeBps: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { kodeBps } = await params;
  if (!isKodeBps(kodeBps)) {
    return NextResponse.json(
      { error: "Invalid kode_bps; must be a 4-digit string." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const useCases = makeUseCases(supabase);
  const defaultModel = await getCachedDefaultModel();

  const [historyResult, predictionResult] = await Promise.all([
    useCases.listRegionIndicatorsHistory.execute(asKodeBps(kodeBps)),
    defaultModel
      ? useCases.listPredictionsByRegion.execute(
          asModelVersion(defaultModel.version),
          asKodeBps(kodeBps),
        )
      : Promise.resolve(null),
  ]);

  if (!historyResult.ok) {
    return NextResponse.json(
      { error: historyResult.error.message },
      { status: 502 },
    );
  }

  const predictionHistory =
    predictionResult && predictionResult.ok ? predictionResult.value : [];

  const body: RegionHistoryResponse = {
    kodeBps,
    history: historyResult.value,
    predictionHistory,
  };
  return NextResponse.json(body, {
    headers: {
      // Tiny payload, idempotent — let the browser/CDN cache it briefly so
      // re-clicking a region within a session is truly instant.
      "Cache-Control": "private, max-age=60",
    },
  });
}
