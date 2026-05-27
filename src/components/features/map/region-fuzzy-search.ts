/**
 * Hand-rolled fuzzy search over the 540-region table.
 *
 * We deliberately do not depend on `fuse.js` here: the dataset is small,
 * the input shape is predictable (Indonesian district names + provinces),
 * and a tightly-scored heuristic beats a library default for our specific
 * usage pattern (users type the start of a name).
 *
 * Scoring (higher is better):
 *   1000  full name match (`Bandung`)
 *    700  word-start prefix match (`Bandung Barat` for query "ban")
 *    500  whole-name prefix match (`Bandung` for query "ban")
 *    250  substring anywhere in the name
 *    150  substring in the province name
 *
 * A small position-aware penalty subtracts the byte offset so earlier
 * matches outrank deeper ones at the same tier. Diacritics are stripped so
 * "Sabéu" matches "Sabeu", and matching is fully case-insensitive.
 */

import type { RegionDto } from "@/application/region/dtos";

export interface RegionSearchHit {
  readonly region: RegionDto;
  readonly score: number;
}

function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function scoreRegion(region: RegionDto, query: string): number {
  const name = normalize(region.kabupatenKota);
  const province = normalize(region.provinsi);
  const q = query;

  if (name === q) return 1000;

  // Word-start prefix: the query starts a word boundary inside the name
  // (matches "Banda Aceh" against query "aceh").
  const wordBoundaryIdx = name.split(/\s+/).findIndex((w) => w.startsWith(q));
  if (wordBoundaryIdx >= 0) {
    return 700 - wordBoundaryIdx;
  }

  if (name.startsWith(q)) return 500;

  const inName = name.indexOf(q);
  if (inName >= 0) return 250 - inName;

  const inProvince = province.indexOf(q);
  if (inProvince >= 0) return 150 - inProvince;

  return -1;
}

/**
 * Returns up to `limit` regions whose name or province matches `query`,
 * sorted by descending score. Falls back to an empty array when the query
 * is shorter than two characters — single-letter searches produce too much
 * noise to be useful.
 */
export function searchRegions(
  regions: readonly RegionDto[],
  query: string,
  limit: number,
): readonly RegionSearchHit[] {
  const q = normalize(query);
  if (q.length < 2) return [];

  const hits: RegionSearchHit[] = [];
  for (const region of regions) {
    const score = scoreRegion(region, q);
    if (score > 0) hits.push({ region, score });
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
}
