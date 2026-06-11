/**
 * Diagnostic: list every region in `regions` that has no matching row in
 * `region_boundaries`, grouped by provinsi. Run with:
 *   npx tsx --env-file=.env.local scripts/diagnose-missing-boundaries.ts
 */

import { createScriptAdminClient, runScript } from "./_lib/script-context.ts";

await runScript("diagnose-missing-boundaries", async ({ logger }) => {
  const client = createScriptAdminClient();

  const { data: regions, error: regionsErr } = await client
    .from("regions")
    .select("kode_bps, provinsi, kabupaten_kota, tipe");
  if (regionsErr) throw new Error(regionsErr.message);

  const { data: boundaries, error: boundariesErr } = await client
    .from("region_boundaries")
    .select("kode_bps");
  if (boundariesErr) throw new Error(boundariesErr.message);

  const boundarySet = new Set((boundaries ?? []).map((b) => b.kode_bps));
  const missing = (regions ?? []).filter((r) => !boundarySet.has(r.kode_bps));
  missing.sort((a, b) => a.kode_bps.localeCompare(b.kode_bps));

  logger.info("counts", {
    totalRegions: regions?.length ?? 0,
    totalBoundaries: boundaries?.length ?? 0,
    missing: missing.length,
  });

  const byProvinsi = new Map<string, typeof missing>();
  for (const row of missing) {
    const list = byProvinsi.get(row.provinsi) ?? [];
    list.push(row);
    byProvinsi.set(row.provinsi, list);
  }
  for (const [provinsi, rows] of [...byProvinsi.entries()].sort()) {
    logger.warn("missing.provinsi", {
      provinsi,
      count: rows.length,
      regions: rows.map((r) => `${r.kode_bps} ${r.tipe} ${r.kabupaten_kota}`),
    });
  }
});
