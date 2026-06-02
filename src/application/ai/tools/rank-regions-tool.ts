/**
 * rankRegions tool: top/bottom N regions by prevalence for a year, optionally
 * scoped to a province.
 */

import { z } from "zod";

import {
  toolFailure,
  type RankRegionsCard,
} from "@/application/ai/cards/ai-card";
import { AI_CARD_TYPES, AI_LIMITS } from "@/config/ai";
import { MAX_YEAR, MIN_YEAR } from "@/config/years";
import { asYear } from "@/domain/region/value-objects/year";

import { defineTool, type AiToolDefinition } from "./ai-tool";
import { loadRegionIndex } from "./region-lookup";
import type { AiToolContext } from "./tool-context";

export function createRankRegionsTool(ctx: AiToolContext): AiToolDefinition {
  return defineTool({
    description:
      "Peringkat kabupaten/kota berdasarkan prevalensi stunting untuk satu tahun. order 'asc' = prevalensi terendah (terbaik) dulu, 'desc' = tertinggi (terburuk) dulu. Bisa difilter per provinsi.",
    inputSchema: z.object({
      tahun: z.number().int().min(MIN_YEAR).max(MAX_YEAR),
      order: z.enum(["asc", "desc"]),
      limit: z.number().int().min(1).max(AI_LIMITS.maxRankLimit),
      provinsi: z.string().min(1).max(64).optional(),
    }),
    execute: async ({ tahun, order, limit, provinsi }) => {
      const [indexRes, indicatorsRes] = await Promise.all([
        loadRegionIndex(ctx.useCases),
        ctx.useCases.listRegionIndicatorsByYear.execute(asYear(tahun)),
      ]);
      if (!indexRes.ok || !indicatorsRes.ok) {
        return toolFailure("no_data", "Data wilayah tidak tersedia saat ini.");
      }
      const provNorm = provinsi?.toLowerCase();
      const entries = indicatorsRes.value
        .map((indicator) => {
          const region = indexRes.value.get(indicator.kodeBps);
          if (!region || indicator.y1Prevalence === null) return null;
          return {
            kodeBps: indicator.kodeBps,
            kabupatenKota: region.kabupatenKota,
            provinsi: region.provinsi,
            prevalence: indicator.y1Prevalence,
            category: indicator.yCategory,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
        .filter(
          (entry) =>
            provNorm === undefined || entry.provinsi.toLowerCase() === provNorm,
        );
      if (entries.length === 0) {
        return toolFailure(
          "no_data",
          "Tidak ada data prevalensi untuk kriteria tersebut.",
        );
      }
      entries.sort((a, b) =>
        order === "asc"
          ? a.prevalence - b.prevalence
          : b.prevalence - a.prevalence,
      );
      const rows: RankRegionsCard["rows"][number][] = entries
        .slice(0, limit)
        .map((entry, index) => ({ rank: index + 1, ...entry }));
      return { type: AI_CARD_TYPES.rankRegions, tahun, order, rows };
    },
  });
}
