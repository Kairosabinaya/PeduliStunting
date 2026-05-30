/**
 * import-dashboard-data — load the GTWENOLR research export into Supabase from
 * the artefacts under `docs/source/dashboard_data/`.
 *
 * Populates (idempotent upserts):
 *   - model_metadata        from model_meta.json (version, eta_sign, metrics,
 *                           baselines, hyperparameters; flagged default)
 *   - indicator_dictionary  UPDATE X1..X20 with transform/std/stats/dimension
 *                           from predictor_meta.csv (existing rows only)
 *   - model_local_fits      from model_coefficients.csv (alfa1, alfa2,
 *                           n_active, converged) per region-year
 *   - model_coefficients    melted from model_coefficients.csv (beta1..beta20
 *                           -> 20 LONG rows per region-year)
 *   - model_predictions     from observations.csv (pred_class + prob_*)
 *
 * It does NOT touch region_indicators: that table already holds the model's
 * fitted predictor values (verified equal to observations.csv), so the what-if
 * simulator reads its defaults from there.
 *
 * Run with:  pnpm import:dashboard
 *
 * Idempotent: upserts on (version) / (model_version,kode_bps,tahun) /
 * (model_version,kode_bps,tahun,predictor_code); dictionary patched by code.
 */

import { readFileSync } from "node:fs";

import { z } from "zod";

import {
  createScriptAdminClient,
  resolveSourcePath,
  runScript,
  type ScriptLogger,
} from "./_lib/script-context.ts";

const MODEL_VERSION = "gtwenolr-adaptif-1.0";
const PREDICTOR_COUNT = 20;
const BATCH_SIZE = 500;

type AdminClient = ReturnType<typeof createScriptAdminClient>;

function parseCsv(text: string): readonly Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
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

function num(value: string | undefined): number {
  const parsed = Number((value ?? "").replace(",", "."));
  if (!Number.isFinite(parsed)) {
    throw new Error(`Expected finite number, got "${value ?? ""}"`);
  }
  return parsed;
}

function optionalNum(value: string | undefined): number | null {
  const trimmed = (value ?? "").trim();
  if (trimmed.length === 0 || trimmed.toUpperCase() === "NA") return null;
  const parsed = Number(trimmed.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function boolFrom(value: string | undefined): boolean {
  const lower = (value ?? "").trim().toLowerCase();
  return lower === "true" || lower === "1";
}

function category(value: string | undefined): "Rendah" | "Sedang" | "Tinggi" {
  const trimmed = (value ?? "").trim();
  if (trimmed === "Rendah" || trimmed === "Sedang" || trimmed === "Tinggi") {
    return trimmed;
  }
  throw new Error(`Unexpected category "${value ?? ""}"`);
}

const ModelMetaSchema = z.object({
  model_name: z.string().min(1),
  prediction: z.object({
    eta_sign: z.number(),
    convention: z.string().optional(),
    formula: z.string().optional(),
    matched_oos_mean_abs_prob_diff: z.number().optional(),
  }),
  hyperparameters: z.array(z.record(z.string(), z.unknown())).default([]),
  performance: z.record(z.string(), z.number()).default({}),
  baselines: z.record(z.string(), z.record(z.string(), z.number())).default({}),
});

async function importMetadata(
  client: AdminClient,
  logger: ScriptLogger,
): Promise<void> {
  const raw = JSON.parse(
    readFileSync(resolveSourcePath("dashboard_data/model_meta.json"), "utf8"),
  );
  const meta = ModelMetaSchema.parse(raw);
  const metrics = {
    accuracy: meta.performance.accuracy_out ?? null,
    qwk: meta.performance.qwk_out ?? null,
    mae: meta.performance.mae_out ?? null,
    accuracy_in: meta.performance.accuracy_in ?? null,
    qwk_in: meta.performance.qwk_in ?? null,
    mae_in: meta.performance.mae_in ?? null,
    baselines: meta.baselines,
    prediction: meta.prediction,
  };

  const { error: resetError } = await client
    .from("model_metadata")
    .update({ is_default: false })
    .neq("version", MODEL_VERSION);
  if (resetError) {
    throw new Error(`Reset is_default failed: ${resetError.message}`);
  }

  const { error } = await client.from("model_metadata").upsert(
    {
      version: MODEL_VERSION,
      name: meta.model_name,
      eta_sign: meta.prediction.eta_sign,
      hyperparameters: (meta.hyperparameters[0] ?? {}) as Record<
        string,
        unknown
      >,
      metrics: metrics as Record<string, unknown>,
      moran_per_year: {},
      is_default: true,
      notes:
        "GTWENOLR bandwidth adaptif. Prediksi lokal per kabupaten/kota-tahun " +
        "memakai intersep dan koefisien yang berbeda di tiap wilayah.",
    },
    { onConflict: "version" },
  );
  if (error) throw new Error(`model_metadata upsert failed: ${error.message}`);
  logger.info("metadata.upserted", { version: MODEL_VERSION });
}

async function importPredictorMeta(
  client: AdminClient,
  logger: ScriptLogger,
): Promise<void> {
  const rows = parseCsv(
    readFileSync(
      resolveSourcePath("dashboard_data/predictor_meta.csv"),
      "utf8",
    ),
  );
  let updated = 0;
  for (const row of rows) {
    const code = (row.id ?? "").trim().toUpperCase();
    if (!/^X\d{1,2}$/.test(code)) continue;
    const { error } = await client
      .from("indicator_dictionary")
      .update({
        unit: (row.unit ?? "").trim() || null,
        transform: (row.transform ?? "none").trim().toLowerCase(),
        std_mean: num(row.std_mean),
        std_sd: num(row.std_sd),
        orig_min: optionalNum(row.orig_min),
        orig_max: optionalNum(row.orig_max),
        orig_p5: optionalNum(row.orig_p5),
        orig_p50: optionalNum(row.orig_p50),
        orig_p95: optionalNum(row.orig_p95),
        pct_active: optionalNum(row.pct_active),
        pct_positive: optionalNum(row.pct_positive),
        median_coef: optionalNum(row.median_coef),
        cor_prevalence: optionalNum(row.cor_prevalence),
        model_dimension: (row.dimension ?? "").trim() || null,
        display_order: Number.parseInt(code.slice(1), 10),
      })
      .eq("code", code);
    if (error) {
      throw new Error(
        `indicator_dictionary ${code} update failed: ${error.message}`,
      );
    }
    updated += 1;
  }
  logger.info("predictor_meta.updated", { updated });
}

async function upsertBatched<T>(
  client: AdminClient,
  table: "model_local_fits" | "model_coefficients" | "model_predictions",
  rows: readonly T[],
  onConflict: string,
  logger: ScriptLogger,
): Promise<void> {
  for (let offset = 0; offset < rows.length; offset += BATCH_SIZE) {
    const batch = rows.slice(offset, offset + BATCH_SIZE);
    const { error } = await client
      .from(table)
      .upsert(batch as never, { onConflict });
    if (error) {
      throw new Error(
        `${table} upsert failed at offset=${offset}: ${error.message}`,
      );
    }
    logger.info(`${table}.batch`, { offset, size: batch.length });
  }
}

async function importCoefficients(
  client: AdminClient,
  logger: ScriptLogger,
): Promise<void> {
  const rows = parseCsv(
    readFileSync(
      resolveSourcePath("dashboard_data/model_coefficients.csv"),
      "utf8",
    ),
  );
  const localFits = rows.map((row) => ({
    model_version: MODEL_VERSION,
    kode_bps: (row.kode_bps ?? "").trim(),
    tahun: num(row.tahun),
    alfa1: num(row.alfa1),
    alfa2: num(row.alfa2),
    n_active: optionalNum(row.n_active),
    converged: boolFrom(row.converged),
  }));
  await upsertBatched(
    client,
    "model_local_fits",
    localFits,
    "model_version,kode_bps,tahun",
    logger,
  );

  const coefficients = rows.flatMap((row) => {
    const kode = (row.kode_bps ?? "").trim();
    const tahun = num(row.tahun);
    const out = [];
    for (let k = 1; k <= PREDICTOR_COUNT; k += 1) {
      out.push({
        model_version: MODEL_VERSION,
        kode_bps: kode,
        tahun,
        predictor_code: `X${k}`,
        coefficient: num(row[`beta${k}`]),
        se: null,
        is_inference: false,
      });
    }
    return out;
  });
  await upsertBatched(
    client,
    "model_coefficients",
    coefficients,
    "model_version,kode_bps,tahun,predictor_code",
    logger,
  );
}

async function importPredictions(
  client: AdminClient,
  logger: ScriptLogger,
): Promise<void> {
  const rows = parseCsv(
    readFileSync(resolveSourcePath("dashboard_data/observations.csv"), "utf8"),
  );
  const predictions = rows.map((row) => ({
    model_version: MODEL_VERSION,
    kode_bps: (row.kode_bps ?? "").trim(),
    tahun: num(row.tahun),
    predicted_category: category(row.pred_class),
    prob_rendah: optionalNum(row.prob_rendah),
    prob_sedang: optionalNum(row.prob_sedang),
    prob_tinggi: optionalNum(row.prob_tinggi),
  }));
  await upsertBatched(
    client,
    "model_predictions",
    predictions,
    "model_version,kode_bps,tahun",
    logger,
  );
}

await runScript("import-dashboard-data", async ({ logger }) => {
  const client = createScriptAdminClient();
  await importMetadata(client, logger);
  await importPredictorMeta(client, logger);
  await importCoefficients(client, logger);
  await importPredictions(client, logger);
});
