/**
 * import-indicators — populate `indicator_dictionary` (Y, Y1, X1..X20) and
 * `region_indicators` (one row per (kode_bps, tahun)) from Dataset.xlsx.
 *
 * Sources inside Dataset.xlsx:
 *   - Sheet `Source` -> indicator_dictionary metadata (name, dimension, unit,
 *     source_label, source_url, effect_direction).
 *   - Sheet `Dataset` -> per-region per-year observations.
 *
 * Run with:
 *   pnpm import:indicators
 *
 * Idempotent: upserts on `code` for the dictionary and on
 * `(kode_bps, tahun)` for region_indicators.
 */

import { readFileSync } from "node:fs";

import { read, utils } from "xlsx";
import { z } from "zod";

import { SUPPORTED_YEARS } from "../src/config/years.ts";
import {
  createScriptAdminClient,
  resolveSourcePath,
  runScript,
  type ScriptLogger,
} from "./_lib/script-context.ts";

const DATASET_SHEET = "Dataset";
const SOURCE_SHEET = "Source";
const INDICATORS_BATCH_SIZE = 200;
const DICTIONARY_BATCH_SIZE = 50;

const PREDICTOR_CODES = [
  "X1",
  "X2",
  "X3",
  "X4",
  "X5",
  "X6",
  "X7",
  "X8",
  "X9",
  "X10",
  "X11",
  "X12",
  "X13",
  "X14",
  "X15",
  "X16",
  "X17",
  "X18",
  "X19",
  "X20",
] as const;

// PREDICTOR_CODES is exported for use in tests; the inferred element type
// stays inline at the few call sites that need it.

/**
 * DB-side CHECK on `indicator_dictionary.dimension` (migration
 * 20260525120300_indicators.sql) uses these seven lowercase codes. Any drift
 * with GLOSSARY.md labels lives in the dashboard config layer, not at the
 * data boundary.
 */
const DimensionEnum = z.enum([
  "outcome",
  "socioeconomic",
  "health_service",
  "environment",
  "demography",
  "nutrition",
  "other",
]);

const EffectDirectionEnum = z.enum(["protective", "risk", "neutral"]);

const DictionaryRowSchema = z.object({
  code: z.string().min(1),
  dimension: DimensionEnum,
  name: z.string().min(1),
  description: z.string().nullable(),
  unit: z.string().nullable(),
  source_label: z.string().nullable(),
  source_url: z.string().url().nullable(),
  effect_direction: EffectDirectionEnum.nullable(),
});

type DictionaryRow = z.infer<typeof DictionaryRowSchema>;

const CategoryEnum = z.enum(["Rendah", "Sedang", "Tinggi"]);

const PredictorValueSchema = z.number().nullable();

const IndicatorRowSchema = z.object({
  kode_bps: z.string().regex(/^\d{4}$/),
  tahun: z.number().int(),
  y_category: CategoryEnum,
  y1_prevalence: z.number().min(0).max(100).nullable(),
  x1: PredictorValueSchema,
  x2: PredictorValueSchema,
  x3: PredictorValueSchema,
  x4: PredictorValueSchema,
  x5: PredictorValueSchema,
  x6: PredictorValueSchema,
  x7: PredictorValueSchema,
  x8: PredictorValueSchema,
  x9: PredictorValueSchema,
  x10: PredictorValueSchema,
  x11: PredictorValueSchema,
  x12: PredictorValueSchema,
  x13: PredictorValueSchema,
  x14: PredictorValueSchema,
  x15: PredictorValueSchema,
  x16: PredictorValueSchema,
  x17: PredictorValueSchema,
  x18: PredictorValueSchema,
  x19: PredictorValueSchema,
  x20: PredictorValueSchema,
});

type IndicatorRow = z.infer<typeof IndicatorRowSchema>;

interface RawSourceRow {
  readonly Variabel?: unknown;
  readonly Variable?: unknown;
  readonly Code?: unknown;
  readonly Keterangan?: unknown;
  readonly Description?: unknown;
  readonly Name?: unknown;
  readonly Dimensi?: unknown;
  readonly Dimension?: unknown;
  readonly Unit?: unknown;
  readonly Satuan?: unknown;
  readonly "Keterangan Sumber"?: unknown;
  readonly Source?: unknown;
  readonly "Tautan Sumber"?: unknown;
  readonly Source_URL?: unknown;
  readonly Effect_Direction?: unknown;
  readonly Effect?: unknown;
  readonly Tahun?: unknown;
  readonly Daerah?: unknown;
}

interface RawDatasetRow {
  readonly Kode_BPS: unknown;
  readonly Tahun: unknown;
  readonly Y: unknown;
  readonly Y1: unknown;
  readonly [predictor: string]: unknown;
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

function coerceText(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  }
  if (typeof value === "number") return String(value);
  return null;
}

function coerceUrl(value: unknown): string | null {
  const text = coerceText(value);
  if (text === null) return null;
  try {
    return new URL(text).toString();
  } catch {
    return null;
  }
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

function coerceCategory(value: unknown): "Rendah" | "Sedang" | "Tinggi" | null {
  const text = coerceText(value);
  if (text === null) return null;
  const lower = text.toLowerCase();
  if (lower === "rendah") return "Rendah";
  if (lower === "sedang") return "Sedang";
  if (lower === "tinggi") return "Tinggi";
  return null;
}

function inferEffectDirection(code: string): "protective" | "risk" | "neutral" {
  // GLOSSARY §B effect direction conventions from Bab4 — protective and risk
  // assignments are stable across model versions, so we default the dictionary
  // entry conservatively rather than encoding the table inside this script.
  const protective = new Set(["X6", "X15", "X16"]);
  const risk = new Set(["X2", "X12", "X13"]);
  if (protective.has(code)) return "protective";
  if (risk.has(code)) return "risk";
  return "neutral";
}

function inferDimension(code: string): z.infer<typeof DimensionEnum> {
  // Default mapping aligned with the DB CHECK constraint (English lowercase
  // codes). Maps Bab4's thematic grouping into the seven schema dimensions.
  // The presentation layer translates back into Indonesian labels via the
  // dashboard config.
  if (code === "Y" || code === "Y1") return "outcome";
  const num = Number(code.replace(/^X/, ""));
  if (!Number.isFinite(num)) return "other";
  if (num >= 1 && num <= 9) return "socioeconomic";
  if (num <= 13) return "health_service";
  if (num <= 18) return "nutrition";
  if (num <= 20) return "demography";
  return "other";
}

/**
 * Map the Indonesian dimension labels used in the `Source` sheet to the
 * lowercase DB enum (CHECK constraint on `indicator_dictionary.dimension`).
 * Unknown labels fall back to {@link inferDimension} based on the code.
 */
function mapDimensionLabel(
  raw: string | null,
): z.infer<typeof DimensionEnum> | null {
  if (raw === null) return null;
  const normalised = raw.toLowerCase().replace(/\s+/g, "");
  if (normalised === "stunting") return "outcome";
  if (normalised.startsWith("sosial") || normalised === "ekonomi")
    return "socioeconomic";
  if (normalised === "pendidikan") return "socioeconomic";
  if (normalised === "kesehatan") return "health_service";
  if (
    normalised.startsWith("ketahananpangan") ||
    normalised.startsWith("konsumsipangan") ||
    normalised === "nutrisi" ||
    normalised === "gizi"
  ) {
    return "nutrition";
  }
  if (normalised === "gender" || normalised === "demografi")
    return "demography";
  if (normalised === "lingkungan") return "environment";
  return null;
}

function extractDictionaryRows(rawRows: readonly RawSourceRow[]): {
  readonly entries: readonly DictionaryRow[];
  readonly invalidCount: number;
} {
  // Dedup by code: the sheet repeats each variable per Tahun×Daerah row, so
  // the first occurrence carries the canonical metadata.
  const byCode = new Map<string, DictionaryRow>();
  let invalidCount = 0;
  for (const row of rawRows) {
    const code = coerceText(row.Variabel ?? row.Variable ?? row.Code);
    if (code === null) {
      invalidCount += 1;
      continue;
    }
    if (byCode.has(code)) continue;
    const name =
      coerceText(row.Keterangan ?? row.Description ?? row.Name) ?? code;
    const description = coerceText(row.Keterangan ?? row.Description);
    const rawDimension = coerceText(row.Dimensi ?? row.Dimension);
    const mapped = mapDimensionLabel(rawDimension);
    const dimensionParsed = DimensionEnum.safeParse(rawDimension);
    const dimension = dimensionParsed.success
      ? dimensionParsed.data
      : (mapped ?? inferDimension(code));
    const unit = coerceText(row.Unit ?? row.Satuan);
    const sourceLabel = coerceText(row["Keterangan Sumber"] ?? row.Source);
    const sourceUrl = coerceUrl(row["Tautan Sumber"] ?? row.Source_URL);
    const effectRaw = coerceText(row.Effect_Direction ?? row.Effect);
    const effectParsed = EffectDirectionEnum.safeParse(effectRaw?.toLowerCase());
    const effect = effectParsed.success
      ? effectParsed.data
      : inferEffectDirection(code);
    const parsed = DictionaryRowSchema.safeParse({
      code,
      dimension,
      name,
      description,
      unit,
      source_label: sourceLabel,
      source_url: sourceUrl,
      effect_direction: effect,
    });
    if (!parsed.success) {
      invalidCount += 1;
      continue;
    }
    byCode.set(code, parsed.data);
  }
  return { entries: [...byCode.values()], invalidCount };
}

function extractIndicatorRows(rawRows: readonly RawDatasetRow[]): {
  readonly entries: readonly IndicatorRow[];
  readonly invalidCount: number;
} {
  const supportedYears = new Set<number>(SUPPORTED_YEARS);
  const seen = new Map<string, IndicatorRow>();
  let invalidCount = 0;
  for (const row of rawRows) {
    const kodeBps = coerceKodeBps(row.Kode_BPS);
    const tahun = coerceNumber(row.Tahun);
    if (kodeBps === null || tahun === null || !supportedYears.has(tahun)) {
      invalidCount += 1;
      continue;
    }
    const yCategory = coerceCategory(row.Y);
    if (yCategory === null) {
      invalidCount += 1;
      continue;
    }
    const predictors: Record<string, number | null> = {};
    for (const code of PREDICTOR_CODES) {
      const lower = code.toLowerCase();
      predictors[lower] = coerceNumber(row[code] ?? row[lower]);
    }
    const parsed = IndicatorRowSchema.safeParse({
      kode_bps: kodeBps,
      tahun,
      y_category: yCategory,
      y1_prevalence: coerceNumber(row.Y1),
      ...predictors,
    });
    if (!parsed.success) {
      invalidCount += 1;
      continue;
    }
    seen.set(`${kodeBps}-${tahun}`, parsed.data);
  }
  return { entries: [...seen.values()], invalidCount };
}

async function upsertDictionary(
  client: ReturnType<typeof createScriptAdminClient>,
  rows: readonly DictionaryRow[],
  logger: ScriptLogger,
): Promise<void> {
  for (
    let offset = 0;
    offset < rows.length;
    offset += DICTIONARY_BATCH_SIZE
  ) {
    const batch = rows.slice(offset, offset + DICTIONARY_BATCH_SIZE);
    const { error } = await client
      .from("indicator_dictionary")
      .upsert(batch as DictionaryRow[], { onConflict: "code" });
    if (error) {
      throw new Error(
        `indicator_dictionary upsert failed at offset=${offset}: ${error.message}`,
      );
    }
    logger.info("dictionary.batch.upserted", {
      offset,
      size: batch.length,
    });
  }
}

async function upsertIndicators(
  client: ReturnType<typeof createScriptAdminClient>,
  rows: readonly IndicatorRow[],
  logger: ScriptLogger,
): Promise<void> {
  for (
    let offset = 0;
    offset < rows.length;
    offset += INDICATORS_BATCH_SIZE
  ) {
    const batch = rows.slice(offset, offset + INDICATORS_BATCH_SIZE);
    const { error } = await client
      .from("region_indicators")
      .upsert(batch as IndicatorRow[], { onConflict: "kode_bps,tahun" });
    if (error) {
      throw new Error(
        `region_indicators upsert failed at offset=${offset}: ${error.message}`,
      );
    }
    logger.info("indicators.batch.upserted", {
      offset,
      size: batch.length,
    });
  }
}

function buildOutcomeDictionaryRows(): readonly DictionaryRow[] {
  // Y and Y1 are not always present as rows in the `Source` sheet (they are
  // outcomes, not predictors). Insert them explicitly so the dictionary is
  // complete after the import runs.
  return [
    {
      code: "Y",
      dimension: "outcome",
      name: "Kategori stunting (ordinal)",
      description:
        "Kategori prevalensi stunting per kabupaten/kota: Rendah/Sedang/Tinggi.",
      unit: null,
      source_label: "SSGI/SKI (Kemenkes)",
      source_url: null,
      effect_direction: "neutral",
    },
    {
      code: "Y1",
      dimension: "outcome",
      name: "Prevalensi stunting",
      description:
        "Persentase balita stunting per kabupaten/kota dalam satu tahun (skala 0-100).",
      unit: "%",
      source_label: "SSGI/SKI (Kemenkes)",
      source_url: null,
      effect_direction: "neutral",
    },
  ];
}

await runScript("import-indicators", async ({ logger }) => {
  const datasetPath = resolveSourcePath("Dataset.xlsx");
  logger.info("dataset.opening", { path: datasetPath });

  const workbook = read(readFileSync(datasetPath), { type: "buffer" });

  const sourceSheet = workbook.Sheets[SOURCE_SHEET];
  if (!sourceSheet) {
    throw new Error(
      `Sheet "${SOURCE_SHEET}" not found. Sheets present: ${workbook.SheetNames.join(", ")}`,
    );
  }
  const rawSourceRows = utils.sheet_to_json<RawSourceRow>(sourceSheet, {
    defval: null,
  });
  const { entries: dictionaryRows, invalidCount: dictionaryInvalid } =
    extractDictionaryRows(rawSourceRows);
  const dictionaryComplete: DictionaryRow[] = [
    ...buildOutcomeDictionaryRows(),
    ...dictionaryRows.filter((row) => row.code !== "Y" && row.code !== "Y1"),
  ];
  logger.info("dictionary.extracted", {
    fromSheet: rawSourceRows.length,
    valid: dictionaryRows.length,
    invalid: dictionaryInvalid,
    finalCount: dictionaryComplete.length,
  });

  const datasetSheet = workbook.Sheets[DATASET_SHEET];
  if (!datasetSheet) {
    throw new Error(
      `Sheet "${DATASET_SHEET}" not found. Sheets present: ${workbook.SheetNames.join(", ")}`,
    );
  }
  const rawDatasetRows = utils.sheet_to_json<RawDatasetRow>(datasetSheet, {
    defval: null,
  });
  const { entries: indicatorRows, invalidCount: indicatorInvalid } =
    extractIndicatorRows(rawDatasetRows);
  logger.info("indicators.extracted", {
    fromSheet: rawDatasetRows.length,
    valid: indicatorRows.length,
    invalid: indicatorInvalid,
  });

  if (indicatorRows.length === 0) {
    throw new Error("No valid region_indicators extracted; aborting.");
  }

  const client = createScriptAdminClient();
  await upsertDictionary(client, dictionaryComplete, logger);
  await upsertIndicators(client, indicatorRows, logger);

  const [{ count: dictCount }, { count: indicatorCount }] = await Promise.all([
    client
      .from("indicator_dictionary")
      .select("code", { count: "exact", head: true }),
    client
      .from("region_indicators")
      .select("id", { count: "exact", head: true }),
  ]);
  logger.info("totals", { dictionary: dictCount, indicators: indicatorCount });
});

// Re-export internal helpers so the unit test in `scripts/import-indicators.test.ts`
// (future work) can exercise the parsers without spinning up Supabase.
export {
  PREDICTOR_CODES,
  extractDictionaryRows,
  extractIndicatorRows,
  inferDimension,
  inferEffectDirection,
};
