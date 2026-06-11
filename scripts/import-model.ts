/**
 * import-model — load model metadata + predictions (+ optional coefficients)
 * into Supabase from artefacts produced by `scripts/export-model-from-rds.R`.
 *
 * Expected input files (under `docs/source/_generated/`):
 *   - model_metadata.json     (required)
 *   - model_predictions.csv   (optional but recommended)
 *   - model_coefficients.csv  (optional; powers the what-if slider on /dashboard)
 *
 * Run with:
 *   Rscript scripts/export-model-from-rds.R   # one-time conversion
 *   pnpm import:model                          # ingest into Supabase
 *
 * Idempotent: upserts on (version) / (model_version, kode_bps, tahun) /
 * (model_version, kode_bps, tahun, predictor_code).
 */

import { existsSync, readFileSync } from "node:fs";

import { z } from "zod";

import {
  createScriptAdminClient,
  resolveGeneratedPath,
  runScript,
  type ScriptLogger,
} from "./_lib/script-context.ts";

const PREDICTIONS_BATCH_SIZE = 200;
const COEFFICIENTS_BATCH_SIZE = 200;

const HyperparametersSchema = z.object({
  hs: z.number().nullable().optional(),
  ht: z.number().nullable().optional(),
  lambda: z.number().nullable().optional(),
  theta: z.number().nullable().optional(),
});

const MetricsSchema = z.object({
  accuracy: z.number().nullable().optional(),
  qwk: z.number().nullable().optional(),
  mae: z.number().nullable().optional(),
  log_score: z.number().nullable().optional(),
});

const MetadataSchema = z.object({
  version: z.string().min(1),
  name: z.string().min(1),
  hyperparameters: HyperparametersSchema,
  metrics: MetricsSchema,
  moran_per_year: z.record(z.string(), z.number()).default({}),
  is_default: z.boolean().default(true),
  notes: z.string().nullable().optional(),
});

type ModelMetadata = z.infer<typeof MetadataSchema>;

const PredictionRowSchema = z.object({
  model_version: z.string().min(1),
  kode_bps: z.string().regex(/^\d{4}$/),
  tahun: z.number().int(),
  predicted_category: z.enum(["Rendah", "Sedang", "Tinggi"]),
  prob_rendah: z.number().min(0).max(1).nullable(),
  prob_sedang: z.number().min(0).max(1).nullable(),
  prob_tinggi: z.number().min(0).max(1).nullable(),
});

type PredictionRow = z.infer<typeof PredictionRowSchema>;

const CoefficientRowSchema = z.object({
  model_version: z.string().min(1),
  kode_bps: z.string().regex(/^\d{4}$/),
  tahun: z.number().int(),
  predictor_code: z.string().min(1),
  coefficient: z.number(),
  se: z.number().nullable(),
  is_inference: z.boolean(),
});

type CoefficientRow = z.infer<typeof CoefficientRowSchema>;

function parseCsv(text: string): readonly Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length < 2) return [];
  const header = lines[0];
  if (header === undefined) return [];
  const columns = header
    .split(",")
    .map((c) => c.trim().replace(/^"|"$/g, "").toLowerCase());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const raw = lines[i];
    if (raw === undefined) continue;
    const cells = raw.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const record: Record<string, string> = {};
    columns.forEach((col, idx) => {
      record[col] = cells[idx] ?? "";
    });
    rows.push(record);
  }
  return rows;
}

function coerceKodeBps(value: string): string | null {
  const trimmed = value.trim();
  if (/^\d{1,4}$/.test(trimmed)) return trimmed.padStart(4, "0");
  return null;
}

function coerceNumber(value: string): number | null {
  if (value.length === 0 || value.toUpperCase() === "NA") return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function coerceCategory(value: string): "Rendah" | "Sedang" | "Tinggi" | null {
  const lower = value.trim().toLowerCase();
  if (lower === "rendah") return "Rendah";
  if (lower === "sedang") return "Sedang";
  if (lower === "tinggi") return "Tinggi";
  return null;
}

function loadMetadata(logger: ScriptLogger): ModelMetadata | null {
  const path = resolveGeneratedPath("model_metadata.json");
  if (!existsSync(path)) {
    logger.warn("metadata.absent", { path });
    return null;
  }
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const parsed = MetadataSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`model_metadata.json invalid: ${parsed.error.message}`);
  }
  return parsed.data;
}

function buildPredictionRows(
  csvRows: readonly Record<string, string>[],
  version: string,
  logger: ScriptLogger,
): readonly PredictionRow[] {
  const out: PredictionRow[] = [];
  let invalid = 0;
  for (const row of csvRows) {
    const kodeRaw = row.kode_bps ?? "";
    const kode_bps = coerceKodeBps(kodeRaw);
    const tahun = coerceNumber(row.tahun ?? "");
    const category = coerceCategory(row.predicted_category ?? "");
    if (kode_bps === null || tahun === null || category === null) {
      invalid += 1;
      continue;
    }
    const parsed = PredictionRowSchema.safeParse({
      model_version: version,
      kode_bps,
      tahun,
      predicted_category: category,
      prob_rendah: coerceNumber(row.prob_rendah ?? ""),
      prob_sedang: coerceNumber(row.prob_sedang ?? ""),
      prob_tinggi: coerceNumber(row.prob_tinggi ?? ""),
    });
    if (parsed.success) out.push(parsed.data);
    else invalid += 1;
  }
  if (invalid > 0) {
    logger.warn("predictions.invalid_rows", { invalid });
  }
  return out;
}

function buildCoefficientRows(
  csvRows: readonly Record<string, string>[],
  version: string,
  logger: ScriptLogger,
): readonly CoefficientRow[] {
  const out: CoefficientRow[] = [];
  let invalid = 0;
  for (const row of csvRows) {
    const kode_bps = coerceKodeBps(row.kode_bps ?? "");
    const tahun = coerceNumber(row.tahun ?? "");
    const coeff = coerceNumber(row.coefficient ?? "");
    const predictor = (row.predictor_code ?? "").trim().toUpperCase();
    if (
      kode_bps === null ||
      tahun === null ||
      coeff === null ||
      predictor.length === 0
    ) {
      invalid += 1;
      continue;
    }
    const isInferenceRaw = (row.is_inference ?? "").toLowerCase();
    const isInference = isInferenceRaw === "true" || isInferenceRaw === "1";
    const parsed = CoefficientRowSchema.safeParse({
      model_version: version,
      kode_bps,
      tahun,
      predictor_code: predictor,
      coefficient: coeff,
      se: coerceNumber(row.se ?? ""),
      is_inference: isInference,
    });
    if (parsed.success) out.push(parsed.data);
    else invalid += 1;
  }
  if (invalid > 0) {
    logger.warn("coefficients.invalid_rows", { invalid });
  }
  return out;
}

async function upsertMetadata(
  client: ReturnType<typeof createScriptAdminClient>,
  metadata: ModelMetadata,
  logger: ScriptLogger,
): Promise<void> {
  if (metadata.is_default) {
    const { error } = await client
      .from("model_metadata")
      .update({ is_default: false })
      .neq("version", metadata.version);
    if (error) {
      throw new Error(
        `Resetting prior is_default flags failed: ${error.message}`,
      );
    }
  }
  const payload = {
    version: metadata.version,
    name: metadata.name,
    hyperparameters: metadata.hyperparameters as Record<string, unknown>,
    metrics: metadata.metrics as Record<string, unknown>,
    moran_per_year: metadata.moran_per_year as Record<string, unknown>,
    is_default: metadata.is_default,
    notes: metadata.notes ?? null,
  };
  const { error } = await client
    .from("model_metadata")
    .upsert(payload, { onConflict: "version" });
  if (error) {
    throw new Error(`model_metadata upsert failed: ${error.message}`);
  }
  logger.info("metadata.upserted", { version: metadata.version });
}

async function upsertPredictions(
  client: ReturnType<typeof createScriptAdminClient>,
  rows: readonly PredictionRow[],
  logger: ScriptLogger,
): Promise<void> {
  for (let offset = 0; offset < rows.length; offset += PREDICTIONS_BATCH_SIZE) {
    const batch = rows.slice(offset, offset + PREDICTIONS_BATCH_SIZE);
    const { error } = await client
      .from("model_predictions")
      .upsert(batch as PredictionRow[], {
        onConflict: "model_version,kode_bps,tahun",
      });
    if (error) {
      throw new Error(
        `model_predictions upsert failed at offset=${offset}: ${error.message}`,
      );
    }
    logger.info("predictions.batch.upserted", {
      offset,
      size: batch.length,
    });
  }
}

async function upsertCoefficients(
  client: ReturnType<typeof createScriptAdminClient>,
  rows: readonly CoefficientRow[],
  logger: ScriptLogger,
): Promise<void> {
  for (
    let offset = 0;
    offset < rows.length;
    offset += COEFFICIENTS_BATCH_SIZE
  ) {
    const batch = rows.slice(offset, offset + COEFFICIENTS_BATCH_SIZE);
    const { error } = await client
      .from("model_coefficients")
      .upsert(batch as CoefficientRow[], {
        onConflict: "model_version,kode_bps,tahun,predictor_code",
      });
    if (error) {
      throw new Error(
        `model_coefficients upsert failed at offset=${offset}: ${error.message}`,
      );
    }
    logger.info("coefficients.batch.upserted", {
      offset,
      size: batch.length,
    });
  }
}

await runScript("import-model", async ({ logger }) => {
  const metadata = loadMetadata(logger);
  if (metadata === null) {
    logger.warn("import-model.no-metadata", {
      hint: "Run `Rscript scripts/export-model-from-rds.R` first to produce docs/source/_generated/model_metadata.json.",
    });
    return;
  }

  const client = createScriptAdminClient();
  await upsertMetadata(client, metadata, logger);

  const predictionsPath = resolveGeneratedPath("model_predictions.csv");
  if (existsSync(predictionsPath)) {
    const csv = parseCsv(readFileSync(predictionsPath, "utf8"));
    const rows = buildPredictionRows(csv, metadata.version, logger);
    logger.info("predictions.parsed", {
      fromCsv: csv.length,
      valid: rows.length,
    });
    if (rows.length > 0) {
      await upsertPredictions(client, rows, logger);
    }
  } else {
    logger.warn("predictions.csv.absent", { predictionsPath });
  }

  const coefficientsPath = resolveGeneratedPath("model_coefficients.csv");
  if (existsSync(coefficientsPath)) {
    const csv = parseCsv(readFileSync(coefficientsPath, "utf8"));
    const rows = buildCoefficientRows(csv, metadata.version, logger);
    logger.info("coefficients.parsed", {
      fromCsv: csv.length,
      valid: rows.length,
    });
    if (rows.length > 0) {
      await upsertCoefficients(client, rows, logger);
    }
  } else {
    logger.warn("coefficients.csv.absent", { coefficientsPath });
  }
});

export { buildCoefficientRows, buildPredictionRows, parseCsv };
