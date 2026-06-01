"use server";

import { z } from "zod";

import type { RegionFitDto } from "@/application/model/dtos";
import { makeUseCases } from "@/composition";
import { DASHBOARD_SIMULATOR } from "@/config/dashboard";
import { asModelVersion } from "@/domain/shared/ids";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";

/**
 * Serializable result of {@link loadRegionFit}. The client only needs the fit
 * (or a user-facing message), so domain entities/AppError never cross the
 * action boundary (project guidelines §14). `fit === null` means the model did not fit
 * the requested region-year — the UI shows a "not modelled" empty state.
 */
export type LoadRegionFitState =
  | { readonly ok: true; readonly fit: RegionFitDto | null }
  | { readonly ok: false; readonly message: string };

const inputSchema = z.object({
  kodeBps: z.string().regex(/^\d{4}$/u),
  tahun: z.number().int().min(2000).max(2100),
});

/**
 * Load one region-year's local fit for the what-if simulator. Public action —
 * no auth required (`/prediksi` is a public surface backed by anon-readable
 * reference tables). The default model version is resolved server-side rather
 * than trusted from the client.
 */
export async function loadRegionFit(
  input: unknown,
): Promise<LoadRegionFitState> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: DASHBOARD_SIMULATOR.loadError };
  }

  const supabase = await createSupabaseServerClient();
  const useCases = makeUseCases(supabase);

  const modelResult = await useCases.getDefaultModelMetadata.execute();
  if (!modelResult.ok || modelResult.value === null) {
    return { ok: false, message: DASHBOARD_SIMULATOR.loadError };
  }

  const fitResult = await useCases.getRegionFit.execute({
    version: asModelVersion(modelResult.value.version),
    kodeBps: parsed.data.kodeBps,
    tahun: parsed.data.tahun,
  });
  if (!fitResult.ok) {
    return { ok: false, message: DASHBOARD_SIMULATOR.loadError };
  }

  return { ok: true, fit: fitResult.value };
}
