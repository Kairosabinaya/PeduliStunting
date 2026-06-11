/**
 * import-boundaries — populate `region_boundaries` with simplified GeoJSON
 * per kabupaten/kota.
 *
 * Pipeline:
 *   1. (Once, externally) the Python helper
 *      `scripts/export-boundaries-from-gpkg.py` reads
 *      `docs/source/indo_kabkota_2023.gpkg` (a SQLite-backed GeoPackage),
 *      decodes the geometry blobs via shapely, simplifies them, and writes
 *      `docs/source/_generated/kabkota.geojson` (gitignored).
 *   2. This script (re-)runs that Python helper as a subprocess to keep the
 *      generated GeoJSON in sync with the source `.gpkg`.
 *   3. Reads `lookup_kabkota_shapefile.csv` to map the shapefile's `WADMKK`
 *      name to the canonical 4-digit `Kode_BPS`.
 *   4. Upserts each feature into `region_boundaries` keyed on `kode_bps`.
 *
 * Why Python and not mapshaper/ogr2ogr? GeoPackage is a SQLite file; reading
 * it from Node requires native `better-sqlite3` bindings that cannot build on
 * Windows without Visual Studio Build Tools. Python ships `sqlite3` in the
 * stdlib and pulls a pure wheel for shapely — no native toolchain required.
 *
 * Run with:
 *   pnpm import:boundaries
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { z } from "zod";

import {
  createScriptAdminClient,
  projectRoot,
  resolveGeneratedPath,
  resolveSourcePath,
  runScript,
  type ScriptLogger,
} from "./_lib/script-context.ts";

// Topology-preserving simplification tolerance, in degrees. Mirrored from
// `scripts/export-boundaries-from-gpkg.py`. Documented at write time so the
// `region_boundaries.simplification_tolerance` audit column is accurate.
const SIMPLIFICATION_TOLERANCE_RECORD = 0.005;
const BOUNDARIES_BATCH_SIZE = 50;
const SOURCE_LABEL =
  "indo_kabkota_2023.gpkg via shapely.simplify (tol=0.005deg, preserve_topology)";

const LookupRowSchema = z.object({
  kode_bps: z.string().regex(/^\d{4}$/),
  wadmkk_match: z.string().min(1),
});

type LookupRow = z.infer<typeof LookupRowSchema>;

interface GeoJsonFeature {
  readonly type: "Feature";
  readonly properties: Record<string, unknown>;
  readonly geometry: unknown;
}

interface GeoJsonFeatureCollection {
  readonly type: "FeatureCollection";
  readonly features: readonly GeoJsonFeature[];
}

interface BoundaryRow {
  readonly kode_bps: string;
  readonly geometry: unknown;
  readonly simplification_tolerance: number;
  readonly source: string;
}

function runPythonExporter(outputPath: string, logger: ScriptLogger): void {
  mkdirSync(dirname(outputPath), { recursive: true });
  const scriptPath = resolve(
    projectRoot(),
    "scripts",
    "export-boundaries-from-gpkg.py",
  );
  logger.info("python.spawn", { script: scriptPath });
  // `shell: true` on Windows mis-tokenises paths with spaces. Run the binary
  // directly; "python" resolves from PATH on both Windows and POSIX.
  const result = spawnSync("python", [scriptPath], {
    cwd: projectRoot(),
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0) {
    throw new Error(
      `python exited with status=${result.status ?? "unknown"}. ` +
        "Make sure `python` is on PATH and `pip install shapely` succeeded.",
    );
  }
  if (!existsSync(outputPath)) {
    throw new Error(
      `Python helper did not produce ${outputPath}. ` +
        "Check stderr above for parse errors.",
    );
  }
}

function normaliseName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\p{Letter}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function parseLookup(csvText: string): readonly LookupRow[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length < 2) {
    throw new Error(
      "lookup_kabkota_shapefile.csv is empty or missing the header row.",
    );
  }
  const header = lines[0];
  if (header === undefined) {
    throw new Error("lookup_kabkota_shapefile.csv header is undefined.");
  }
  const columns = header.split(",").map((c) => c.trim().toLowerCase());
  const kodeIdx = columns.findIndex(
    (c) => c === "kode_fisik" || c === "kode_bps",
  );
  const wadmkkIdx = columns.findIndex(
    (c) => c === "wadmkk_match" || c === "wadmkk",
  );
  if (kodeIdx < 0 || wadmkkIdx < 0) {
    throw new Error(
      `lookup CSV columns missing kode (kode_fisik/kode_bps) or wadmkk (wadmkk_match/wadmkk). Got: ${columns.join(", ")}`,
    );
  }
  const rows: LookupRow[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const raw = lines[i];
    if (raw === undefined) continue;
    const cells = raw.split(",");
    const kode = cells[kodeIdx]?.trim().padStart(4, "0");
    const wadmkk = cells[wadmkkIdx]?.trim();
    if (kode === undefined || wadmkk === undefined) continue;
    const parsed = LookupRowSchema.safeParse({
      kode_bps: kode,
      wadmkk_match: wadmkk,
    });
    if (parsed.success) rows.push(parsed.data);
  }
  return rows;
}

function buildBoundaryRows(
  featureCollection: GeoJsonFeatureCollection,
  lookup: readonly LookupRow[],
  logger: ScriptLogger,
): readonly BoundaryRow[] {
  const byNormalisedName = new Map<string, string>(); // name -> kode_bps
  for (const row of lookup) {
    byNormalisedName.set(normaliseName(row.wadmkk_match), row.kode_bps);
  }

  const rows: BoundaryRow[] = [];
  const unmatched: string[] = [];
  for (const feature of featureCollection.features) {
    const wadmkkRaw =
      typeof feature.properties.WADMKK === "string"
        ? feature.properties.WADMKK
        : typeof feature.properties.wadmkk === "string"
          ? (feature.properties.wadmkk as string)
          : null;
    if (wadmkkRaw === null) {
      unmatched.push("<missing WADMKK property>");
      continue;
    }
    const kodeBps = byNormalisedName.get(normaliseName(wadmkkRaw));
    if (kodeBps === undefined) {
      unmatched.push(wadmkkRaw);
      continue;
    }
    rows.push({
      kode_bps: kodeBps,
      geometry: feature.geometry,
      simplification_tolerance: SIMPLIFICATION_TOLERANCE_RECORD,
      source: SOURCE_LABEL,
    });
  }
  logger.info("boundaries.match", {
    matched: rows.length,
    unmatched: unmatched.length,
  });
  if (unmatched.length > 0) {
    logger.warn("boundaries.unmatched_features", {
      sample: unmatched.slice(0, 10),
    });
  }
  return rows;
}

async function upsertBoundaries(
  client: ReturnType<typeof createScriptAdminClient>,
  rows: readonly BoundaryRow[],
  logger: ScriptLogger,
): Promise<void> {
  for (let offset = 0; offset < rows.length; offset += BOUNDARIES_BATCH_SIZE) {
    const batch = rows.slice(offset, offset + BOUNDARIES_BATCH_SIZE);
    const { error } = await client.from("region_boundaries").upsert(
      batch.map((row) => ({
        kode_bps: row.kode_bps,
        geometry: row.geometry as never,
        simplification_tolerance: row.simplification_tolerance,
        source: row.source,
      })),
      { onConflict: "kode_bps" },
    );
    if (error) {
      throw new Error(
        `region_boundaries upsert failed at offset=${offset}: ${error.message}`,
      );
    }
    logger.info("boundaries.batch.upserted", {
      offset,
      size: batch.length,
    });
  }
}

await runScript("import-boundaries", async ({ logger }) => {
  // Resolve the .gpkg early to surface a clear error if the source is missing.
  resolveSourcePath("indo_kabkota_2023.gpkg");
  const lookupPath = resolveSourcePath("lookup_kabkota_shapefile.csv");
  const generatedPath = resolveGeneratedPath("kabkota.geojson");

  logger.info("boundaries.starting", {
    lookupPath,
    generatedPath,
    simplificationToleranceDeg: SIMPLIFICATION_TOLERANCE_RECORD,
  });

  runPythonExporter(generatedPath, logger);

  const lookupCsv = readFileSync(lookupPath, "utf8");
  const lookup = parseLookup(lookupCsv);
  logger.info("lookup.parsed", { rows: lookup.length });

  const featureCollection = JSON.parse(
    readFileSync(generatedPath, "utf8"),
  ) as GeoJsonFeatureCollection;
  if (featureCollection.type !== "FeatureCollection") {
    throw new Error(
      `Expected FeatureCollection in ${generatedPath}, got type=${featureCollection.type}.`,
    );
  }
  logger.info("geojson.loaded", {
    features: featureCollection.features.length,
  });

  const rows = buildBoundaryRows(featureCollection, lookup, logger);
  if (rows.length === 0) {
    throw new Error(
      "No boundaries matched between GeoJSON features and lookup CSV. " +
        "Check that WADMKK values align with the lookup `WADMKK_Match` column.",
    );
  }

  const client = createScriptAdminClient();
  await upsertBoundaries(client, rows, logger);

  const { count, error } = await client
    .from("region_boundaries")
    .select("kode_bps", { count: "exact", head: true });
  if (error) {
    logger.warn("boundaries.count.failed", { error: error.message });
  } else {
    logger.info("boundaries.total", { count });
  }
});

export { buildBoundaryRows, normaliseName, parseLookup };
