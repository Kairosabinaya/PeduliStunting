import "server-only";

/**
 * Typed, validated loader for the build-time choropleth path set
 * (`src/lib/data/choropleth-paths.json`, produced by
 * `scripts/generate-choropleth-svg.ts`).
 *
 * The JSON is a trusted build artifact, but it crosses a module boundary into
 * the app, so it is validated once with Zod at import time (project guidelines §2.1 —
 * the single `as unknown` is immediately narrowed by a runtime check). Parsing
 * happens once per server process (module-level), so the per-render cost is
 * zero.
 */

import { z } from "zod";

// Relative (not `@/lib/...`) import: the JSON alias resolves under Next/tsc but
// not under vitest's resolver on Windows, and a relative path resolves
// identically in every toolchain.
import rawData from "../../../../lib/data/choropleth-paths.json";

const SeveritySchema = z.enum(["Rendah", "Sedang", "Tinggi"]).nullable();

const PathSchema = z.object({
  kodeBps: z.string(),
  kabupatenKota: z.string(),
  provinsi: z.string(),
  severity: SeveritySchema,
  prevalence: z.number().nullable(),
  d: z.string().min(1),
});

const ChoroplethSchema = z.object({
  generatedFor: z.string(),
  viewBox: z.object({ width: z.number(), height: z.number() }),
  year: z.number(),
  paths: z.array(PathSchema),
});

export type ChoroplethSeverity = z.infer<typeof SeveritySchema>;
export type ChoroplethPath = z.infer<typeof PathSchema>;
export type ChoroplethData = z.infer<typeof ChoroplethSchema>;

export const CHOROPLETH: ChoroplethData = ChoroplethSchema.parse(
  rawData as unknown,
);

export interface SeverityCounts {
  readonly Rendah: number;
  readonly Sedang: number;
  readonly Tinggi: number;
  readonly tidakTersedia: number;
}

/** Tally districts per severity for the legend + sr-only data summary. */
export function countBySeverity(
  paths: readonly ChoroplethPath[],
): SeverityCounts {
  const counts = { Rendah: 0, Sedang: 0, Tinggi: 0, tidakTersedia: 0 };
  for (const path of paths) {
    if (path.severity === null) counts.tidakTersedia += 1;
    else counts[path.severity] += 1;
  }
  return counts;
}
