/**
 * findRegion tool: resolve a free-text region name to candidate kodeBps values
 * so the model never guesses a code. Returns matches (not a card).
 */

import { z } from "zod";

import { toolFailure } from "@/application/ai/cards/ai-card";
import { AI_LIMITS } from "@/config/ai";

import { defineTool, type AiToolDefinition } from "./ai-tool";
import { loadRegionIndex, matchRegions } from "./region-lookup";
import type { AiToolContext } from "./tool-context";

export function createFindRegionTool(ctx: AiToolContext): AiToolDefinition {
  return defineTool({
    description:
      "Cari kode wilayah (kode_bps) berdasarkan nama kabupaten/kota. Panggil ini sebelum tool data lain bila pengguna menyebut nama wilayah. Mengembalikan daftar kandidat.",
    inputSchema: z.object({
      query: z
        .string()
        .min(1)
        .max(64)
        .describe("Nama kabupaten/kota, mis. 'Surabaya'."),
    }),
    execute: async ({ query }) => {
      const index = await loadRegionIndex(ctx.useCases);
      if (!index.ok) {
        return toolFailure(
          "no_data",
          "Daftar wilayah tidak tersedia saat ini.",
        );
      }
      const matches = matchRegions(
        index.value.values(),
        query,
        AI_LIMITS.maxRegionMatches,
      );
      if (matches.length === 0) {
        return toolFailure(
          "not_found",
          `Tidak ada wilayah yang cocok dengan "${query}".`,
        );
      }
      return { ok: true, matches };
    },
  });
}
