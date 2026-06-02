/**
 * Shared region helpers for the AI tools: load a kodeBps -> RegionRef index and
 * fuzzy-match a user-supplied name to candidate regions. Kept pure and small so
 * each tool stays focused.
 */

import type { RegionRef } from "@/application/ai/cards/ai-card";
import type { AppError } from "@/domain/errors/app-error";
import { ok, type Result } from "@/domain/shared/result";

import type { AiToolUseCases } from "./tool-context";

/** Build a kodeBps -> RegionRef lookup from the region list use case. */
export async function loadRegionIndex(
  useCases: AiToolUseCases,
): Promise<Result<ReadonlyMap<string, RegionRef>, AppError>> {
  const res = await useCases.listRegions.execute();
  if (!res.ok) return res;
  const map = new Map<string, RegionRef>();
  for (const r of res.value) {
    map.set(r.kodeBps, {
      kodeBps: r.kodeBps,
      kabupatenKota: r.kabupatenKota,
      provinsi: r.provinsi,
    });
  }
  return ok(map);
}

/** Strip administrative prefixes so "Kota Surabaya" matches "surabaya". */
function stripPrefix(name: string): string {
  return name
    .toLowerCase()
    .replace(
      /^(kota administrasi|kabupaten administrasi|kota|kabupaten|kab\.?)\s+/i,
      "",
    )
    .trim();
}

/**
 * Fuzzy-match a free-text query against region names. Returns up to `limit`
 * candidates, exact name matches first, then shorter (closer) names.
 */
export function matchRegions(
  regions: Iterable<RegionRef>,
  query: string,
  limit: number,
): RegionRef[] {
  const q = stripPrefix(query);
  if (q.length === 0) return [];
  const lowerQuery = query.toLowerCase();
  const matches: { ref: RegionRef; score: number }[] = [];
  for (const ref of regions) {
    const name = stripPrefix(ref.kabupatenKota);
    const full = ref.kabupatenKota.toLowerCase();
    if (name.includes(q) || full.includes(lowerQuery)) {
      matches.push({ ref, score: name === q ? 0 : name.length });
    }
  }
  matches.sort((a, b) => a.score - b.score);
  return matches.slice(0, limit).map((m) => m.ref);
}
