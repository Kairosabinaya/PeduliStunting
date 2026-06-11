/**
 * backfill-papua-boundaries — copy the shapefile geometry of the pre-pemekaran
 * Papua entities onto the new BPS codes that the dataset uses.
 *
 * Background: `indo_kabkota_2023.gpkg` predates Indonesia's 2022 Papua
 * reorganisation. The shapefile still numbers kabupaten/kota under Papua Barat
 * (91xx) and Papua (94xx). The Dataset.xlsx that drives `regions` uses the
 * post-pemekaran numbering (Papua Barat Daya 92xx, Papua Selatan 95xx, Papua
 * Tengah 96xx, Papua Pegunungan 97xx). The two systems describe identical
 * physical regions — only the provincial grouping changed — so we duplicate
 * the geometry row from the legacy code onto the new code.
 *
 * Run with:
 *   pnpm import:papua
 *
 * Idempotent: upserts on `region_boundaries.kode_bps`.
 */

import {
  createScriptAdminClient,
  runScript,
  type ScriptLogger,
} from "./_lib/script-context.ts";

const SOURCE_LABEL_SUFFIX = " (backfilled from pre-2022 Papua code)";

async function listMissingRegions(
  client: ReturnType<typeof createScriptAdminClient>,
): Promise<
  readonly { kode_bps: string; kabupaten_kota: string; provinsi: string }[]
> {
  const { data: regions, error: regionsErr } = await client
    .from("regions")
    .select("kode_bps, provinsi, kabupaten_kota");
  if (regionsErr) throw new Error(regionsErr.message);
  const { data: boundaries, error: boundariesErr } = await client
    .from("region_boundaries")
    .select("kode_bps");
  if (boundariesErr) throw new Error(boundariesErr.message);
  const have = new Set((boundaries ?? []).map((b) => b.kode_bps));
  return (regions ?? []).filter((r) => !have.has(r.kode_bps));
}

interface LegacyBoundary {
  kode_bps: string;
  kabupaten_kota: string;
  geometry: unknown;
  simplification_tolerance: number | null;
  source: string | null;
}

async function fetchLegacyBoundaries(
  client: ReturnType<typeof createScriptAdminClient>,
): Promise<Map<string, LegacyBoundary>> {
  // Pull every boundary plus its joined region name so we can match by
  // kabupaten/kota when the BPS code has been renumbered.
  const { data, error } = await client
    .from("region_boundaries")
    .select(
      "kode_bps, geometry, simplification_tolerance, source, regions!inner(kabupaten_kota)",
    );
  if (error) throw new Error(error.message);
  const byName = new Map<string, LegacyBoundary>();
  for (const row of data ?? []) {
    const region = (row as { regions?: { kabupaten_kota?: string } }).regions;
    const name = region?.kabupaten_kota;
    if (typeof name !== "string") continue;
    byName.set(normaliseName(name), {
      kode_bps: row.kode_bps,
      kabupaten_kota: name,
      geometry: row.geometry,
      simplification_tolerance: row.simplification_tolerance,
      source: row.source,
    });
  }
  return byName;
}

function normaliseName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\p{Letter}\s]/gu, "")
    .replace(/\s+/g, " ")
    .replace(/^kota\s+/i, "")
    .trim()
    .toLowerCase();
}

interface BackfillPlanItem {
  readonly newCode: string;
  readonly name: string;
  readonly provinsi: string;
  readonly source: LegacyBoundary;
}

async function planBackfill(
  client: ReturnType<typeof createScriptAdminClient>,
  logger: ScriptLogger,
): Promise<readonly BackfillPlanItem[]> {
  const missing = await listMissingRegions(client);
  logger.info("missing.regions.total", { count: missing.length });
  if (missing.length === 0) return [];

  const legacy = await fetchLegacyBoundaries(client);
  const plan: BackfillPlanItem[] = [];
  const unmatched: { kode_bps: string; kabupaten_kota: string }[] = [];
  for (const row of missing) {
    const key = normaliseName(row.kabupaten_kota);
    const source = legacy.get(key);
    if (!source) {
      unmatched.push(row);
      continue;
    }
    plan.push({
      newCode: row.kode_bps,
      name: row.kabupaten_kota,
      provinsi: row.provinsi,
      source,
    });
  }
  logger.info("plan.summary", {
    planned: plan.length,
    unmatched: unmatched.length,
  });
  if (unmatched.length > 0) {
    logger.warn("plan.unmatched", { rows: unmatched });
  }
  return plan;
}

async function applyBackfill(
  client: ReturnType<typeof createScriptAdminClient>,
  plan: readonly BackfillPlanItem[],
  logger: ScriptLogger,
): Promise<void> {
  if (plan.length === 0) {
    logger.info("backfill.noop", { reason: "no missing regions" });
    return;
  }
  const rows = plan.map((item) => ({
    kode_bps: item.newCode,
    geometry: item.source.geometry as never,
    simplification_tolerance: item.source.simplification_tolerance,
    source: `${item.source.source ?? "legacy boundary"}${SOURCE_LABEL_SUFFIX} via ${item.source.kode_bps}`,
  }));
  const { error } = await client
    .from("region_boundaries")
    .upsert(rows, { onConflict: "kode_bps" });
  if (error) {
    throw new Error(`backfill upsert failed: ${error.message}`);
  }
  logger.info("backfill.upserted", { count: rows.length });
}

await runScript("backfill-papua-boundaries", async ({ logger }) => {
  const client = createScriptAdminClient();
  const plan = await planBackfill(client, logger);
  await applyBackfill(client, plan, logger);

  const { count, error } = await client
    .from("region_boundaries")
    .select("kode_bps", { count: "exact", head: true });
  if (error) {
    logger.warn("count.failed", { error: error.message });
  } else {
    logger.info("boundaries.total.after", { count });
  }
});
