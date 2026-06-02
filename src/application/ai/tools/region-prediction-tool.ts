/**
 * regionPrediction tool: the default model's predicted category + class
 * probabilities for one region and year.
 */

import { z } from "zod";

import { toolFailure } from "@/application/ai/cards/ai-card";
import { AI_CARD_TYPES } from "@/config/ai";
import { MAX_YEAR, MIN_YEAR } from "@/config/years";
import { asModelVersion } from "@/domain/shared/ids";
import { asKodeBps } from "@/domain/region/value-objects/kode-bps";

import { defineTool, type AiToolDefinition } from "./ai-tool";
import type { AiToolContext } from "./tool-context";

export function createRegionPredictionTool(
  ctx: AiToolContext,
): AiToolDefinition {
  return defineTool({
    description:
      "Prediksi model GTWENOLR untuk satu kabupaten/kota dan tahun: kategori prediksi dan probabilitas kelas (Rendah/Sedang/Tinggi). Pakai kode_bps dari findRegion.",
    inputSchema: z.object({
      kodeBps: z.string().min(1).max(32),
      // Predictions may extend one year past the observed range.
      tahun: z
        .number()
        .int()
        .min(MIN_YEAR)
        .max(MAX_YEAR + 1),
    }),
    execute: async ({ kodeBps, tahun }) => {
      const [regionRes, modelRes] = await Promise.all([
        ctx.useCases.getRegionByKodeBps.execute(asKodeBps(kodeBps)),
        ctx.useCases.getDefaultModelMetadata.execute(),
      ]);
      if (!regionRes.ok || !regionRes.value) {
        return toolFailure("not_found", "Wilayah tidak ditemukan.");
      }
      if (!modelRes.ok || !modelRes.value) {
        return toolFailure("no_data", "Metadata model tidak tersedia.");
      }
      const region = regionRes.value;
      const predsRes = await ctx.useCases.listPredictionsByRegion.execute(
        asModelVersion(modelRes.value.version),
        asKodeBps(kodeBps),
      );
      if (!predsRes.ok) {
        return toolFailure("no_data", "Prediksi tidak tersedia.");
      }
      const prediction = predsRes.value.find((p) => p.tahun === tahun);
      if (!prediction) {
        return toolFailure(
          "no_data",
          `Tidak ada prediksi untuk ${region.kabupatenKota} tahun ${tahun}.`,
        );
      }
      return {
        type: AI_CARD_TYPES.regionPrediction,
        kodeBps,
        kabupatenKota: region.kabupatenKota,
        provinsi: region.provinsi,
        tahun,
        modelVersion: prediction.modelVersion,
        predictedCategory: prediction.predictedCategory,
        probabilities: {
          rendah: prediction.probRendah,
          sedang: prediction.probSedang,
          tinggi: prediction.probTinggi,
        },
      };
    },
  });
}
