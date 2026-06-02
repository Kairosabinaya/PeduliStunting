/**
 * regionTrend tool: prevalence + category time series for one region (2021-2024).
 */

import { z } from "zod";

import {
  toolFailure,
  type RegionTrendCard,
} from "@/application/ai/cards/ai-card";
import { AI_CARD_TYPES } from "@/config/ai";
import { asKodeBps } from "@/domain/region/value-objects/kode-bps";

import { defineTool, type AiToolDefinition } from "./ai-tool";
import type { AiToolContext } from "./tool-context";

export function createRegionTrendTool(ctx: AiToolContext): AiToolDefinition {
  return defineTool({
    description:
      "Tampilkan tren prevalensi stunting satu kabupaten/kota lintas tahun (2021-2024). Pakai kode_bps dari findRegion.",
    inputSchema: z.object({
      kodeBps: z.string().min(1).max(32),
    }),
    execute: async ({ kodeBps }) => {
      const [regionRes, historyRes] = await Promise.all([
        ctx.useCases.getRegionByKodeBps.execute(asKodeBps(kodeBps)),
        ctx.useCases.listRegionIndicatorsHistory.execute(asKodeBps(kodeBps)),
      ]);
      if (!regionRes.ok || !regionRes.value) {
        return toolFailure("not_found", "Wilayah tidak ditemukan.");
      }
      if (!historyRes.ok || historyRes.value.length === 0) {
        return toolFailure(
          "no_data",
          `Riwayat tidak tersedia untuk ${regionRes.value.kabupatenKota}.`,
        );
      }
      const region = regionRes.value;
      const series: RegionTrendCard["series"][number][] = [...historyRes.value]
        .sort((a, b) => a.tahun - b.tahun)
        .map((indicator) => ({
          tahun: indicator.tahun,
          prevalence: indicator.y1Prevalence,
          category: indicator.yCategory,
        }));
      return {
        type: AI_CARD_TYPES.regionTrend,
        kodeBps,
        kabupatenKota: region.kabupatenKota,
        provinsi: region.provinsi,
        series,
      };
    },
  });
}
