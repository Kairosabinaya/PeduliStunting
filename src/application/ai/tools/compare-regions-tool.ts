/**
 * compareRegions tool: compare prevalence + category of 2-4 regions for a year.
 */

import { z } from "zod";

import {
  toolFailure,
  type CompareRegionsCard,
} from "@/application/ai/cards/ai-card";
import { AI_CARD_TYPES, AI_LIMITS } from "@/config/ai";
import { MAX_YEAR, MIN_YEAR } from "@/config/years";
import { asYear } from "@/domain/region/value-objects/year";

import { defineTool, type AiToolDefinition } from "./ai-tool";
import { loadRegionIndex } from "./region-lookup";
import type { AiToolContext } from "./tool-context";

export function createCompareRegionsTool(ctx: AiToolContext): AiToolDefinition {
  return defineTool({
    description:
      "Bandingkan prevalensi stunting dan kategori antar 2-4 kabupaten/kota untuk satu tahun. Pakai kode_bps dari findRegion.",
    inputSchema: z.object({
      kodeBpsList: z
        .array(z.string().min(1).max(32))
        .min(AI_LIMITS.minCompareRegions)
        .max(AI_LIMITS.maxCompareRegions),
      tahun: z.number().int().min(MIN_YEAR).max(MAX_YEAR),
    }),
    execute: async ({ kodeBpsList, tahun }) => {
      const [indexRes, indicatorsRes] = await Promise.all([
        loadRegionIndex(ctx.useCases),
        ctx.useCases.listRegionIndicatorsByYear.execute(asYear(tahun)),
      ]);
      if (!indexRes.ok || !indicatorsRes.ok) {
        return toolFailure("no_data", "Data wilayah tidak tersedia saat ini.");
      }
      const byCode = new Map(indicatorsRes.value.map((i) => [i.kodeBps, i]));
      const rows: CompareRegionsCard["rows"][number][] = [];
      for (const code of kodeBpsList) {
        const region = indexRes.value.get(code);
        const indicator = byCode.get(code);
        if (!region || !indicator) continue;
        rows.push({
          kodeBps: code,
          kabupatenKota: region.kabupatenKota,
          provinsi: region.provinsi,
          prevalence: indicator.y1Prevalence,
          category: indicator.yCategory,
        });
      }
      if (rows.length === 0) {
        return toolFailure(
          "not_found",
          "Wilayah yang diminta tidak ditemukan.",
        );
      }
      return { type: AI_CARD_TYPES.compareRegions, tahun, rows };
    },
  });
}
