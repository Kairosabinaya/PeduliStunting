/**
 * import-regions — populate the `regions` table from Dataset.xlsx.
 *
 * Source: `docs/source/Dataset.xlsx`, sheet `Dataset` (one row per
 * (Kode_BPS, Tahun); we collapse to distinct Kode_BPS for the canonical
 * regions table). Provinsi/Kabupaten_Kota/Tipe/Latitude/Longitude are
 * expected to be stable across years, so the latest row wins on conflicts.
 *
 * Run with:
 *   pnpm import:regions
 *
 * The script is idempotent: re-running upserts on `kode_bps`.
 */

import { readFileSync } from "node:fs";

import { read, utils } from "xlsx";
import { z } from "zod";

import {
  createScriptAdminClient,
  resolveSourcePath,
  runScript,
  type ScriptLogger,
} from "./_lib/script-context.ts";

const DATASET_SHEET = "Dataset";
const REGIONS_BATCH_SIZE = 200;

const RegionRowSchema = z.object({
  kode_bps: z.string().regex(/^\d{4}$/, "kode_bps must be a 4-digit string"),
  provinsi: z.string().min(1),
  kabupaten_kota: z.string().min(1),
  tipe: z.enum(["Kabupaten", "Kota"]),
  latitude: z.number().min(-11.5).max(6.5).nullable(),
  longitude: z.number().min(94).max(142).nullable(),
});

type RegionRow = z.infer<typeof RegionRowSchema>;

interface RawDatasetRow {
  readonly Kode_BPS: unknown;
  readonly Provinsi: unknown;
  readonly Kabupaten_Kota: unknown;
  readonly Tipe: unknown;
  readonly Latitude: unknown;
  readonly Longitude: unknown;
}

function coerceKodeBps(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value)).padStart(4, "0");
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{1,4}$/.test(trimmed)) return trimmed.padStart(4, "0");
  }
  return null;
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;
    const parsed = Number(trimmed.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function coerceText(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  }
  if (typeof value === "number") return String(value);
  return null;
}

function coerceTipe(value: unknown): "Kabupaten" | "Kota" | null {
  const text = coerceText(value);
  if (text === null) return null;
  const lower = text.toLowerCase();
  if (lower.includes("kota")) return "Kota";
  if (lower.includes("kabupaten")) return "Kabupaten";
  return null;
}

function extractRegionRows(rawRows: readonly RawDatasetRow[]): {
  readonly regions: readonly RegionRow[];
  readonly invalidCount: number;
} {
  const seen = new Map<string, RegionRow>();
  let invalidCount = 0;
  for (const row of rawRows) {
    const kodeBps = coerceKodeBps(row.Kode_BPS);
    const provinsi = coerceText(row.Provinsi);
    const kabupatenKota = coerceText(row.Kabupaten_Kota);
    const tipe = coerceTipe(row.Tipe);
    if (!kodeBps || !provinsi || !kabupatenKota || !tipe) {
      invalidCount += 1;
      continue;
    }
    const parsed = RegionRowSchema.safeParse({
      kode_bps: kodeBps,
      provinsi,
      kabupaten_kota: kabupatenKota,
      tipe,
      latitude: coerceNumber(row.Latitude),
      longitude: coerceNumber(row.Longitude),
    });
    if (!parsed.success) {
      invalidCount += 1;
      continue;
    }
    seen.set(parsed.data.kode_bps, parsed.data);
  }
  return { regions: [...seen.values()], invalidCount };
}

async function upsertRegions(
  client: ReturnType<typeof createScriptAdminClient>,
  rows: readonly RegionRow[],
  logger: ScriptLogger,
): Promise<void> {
  for (let offset = 0; offset < rows.length; offset += REGIONS_BATCH_SIZE) {
    const batch = rows.slice(offset, offset + REGIONS_BATCH_SIZE);
    const { error } = await client
      .from("regions")
      .upsert(batch as RegionRow[], { onConflict: "kode_bps" });
    if (error) {
      throw new Error(
        `regions upsert failed at offset=${offset}: ${error.message}`,
      );
    }
    logger.info("regions.batch.upserted", {
      offset,
      size: batch.length,
    });
  }
}

await runScript("import-regions", async ({ logger }) => {
  const datasetPath = resolveSourcePath("Dataset.xlsx");
  logger.info("dataset.opening", { path: datasetPath });

  const workbook = read(readFileSync(datasetPath), { type: "buffer" });
  const sheet = workbook.Sheets[DATASET_SHEET];
  if (!sheet) {
    throw new Error(
      `Sheet "${DATASET_SHEET}" not found. Sheets present: ${workbook.SheetNames.join(", ")}`,
    );
  }
  const rawRows = utils.sheet_to_json<RawDatasetRow>(sheet, {
    defval: null,
  });
  logger.info("dataset.parsed", { rawRows: rawRows.length });

  const { regions, invalidCount } = extractRegionRows(rawRows);
  logger.info("regions.extracted", {
    distinctRegions: regions.length,
    invalidRows: invalidCount,
  });

  if (regions.length === 0) {
    throw new Error("No valid region rows extracted; aborting.");
  }

  const client = createScriptAdminClient();
  await upsertRegions(client, regions, logger);

  const { count, error } = await client
    .from("regions")
    .select("kode_bps", { count: "exact", head: true });
  if (error) {
    logger.warn("regions.count.failed", { error: error.message });
  } else {
    logger.info("regions.total", { count });
  }
});
