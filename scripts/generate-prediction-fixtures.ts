/**
 * generate-prediction-fixtures — extract a committed, CI-safe fixture for the
 * ordinal-predictor verification test from the research CSVs.
 *
 * The raw research artefacts under `docs/source/dashboard_data/` are gitignored,
 * so CI cannot read them. This script distills a deterministic, stratified
 * sample (plus the shared predictor meta + eta sign) into
 * `tests/fixtures/ordinal-prediction-cases.json`, which IS committed. The
 * verification test (`ordinal-predictor.test.ts`) runs against this sample in
 * every environment, and additionally sweeps the full CSV set when present.
 *
 * Pure extraction — it does NOT run the prediction itself. It copies the
 * model's own `pred_class_local` + `prob_*` columns as the expected output, so
 * the test reconciles `predictOrdinal()` against the model's exported truth.
 *
 * Run with:
 *   pnpm gen:prediction-fixtures
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  projectRoot,
  resolveSourcePath,
  runScript,
  type ScriptLogger,
} from "./_lib/script-context.ts";

const PREDICTOR_COUNT = 20;
const SAMPLE_SIZE = 160;

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

function num(value: string | undefined): number {
  const parsed = Number((value ?? "").replace(",", "."));
  if (!Number.isFinite(parsed)) {
    throw new Error(`Expected finite number, got "${value ?? ""}"`);
  }
  return parsed;
}

interface MetaPoint {
  readonly code: string;
  readonly transform: "none" | "log" | "log1p";
  readonly stdMean: number;
  readonly stdSd: number;
}

function buildMeta(): readonly MetaPoint[] {
  const rows = parseCsv(
    readFileSync(
      resolveSourcePath("dashboard_data/predictor_meta.csv"),
      "utf8",
    ),
  );
  const meta = rows
    .map((row) => {
      const id = (row.id ?? "").toUpperCase();
      const order = Number.parseInt(id.slice(1), 10);
      const transform = (row.transform ?? "none").toLowerCase();
      if (
        transform !== "none" &&
        transform !== "log" &&
        transform !== "log1p"
      ) {
        throw new Error(`Unknown transform "${transform}" for ${id}`);
      }
      return {
        order,
        point: {
          code: id,
          transform,
          stdMean: num(row.std_mean),
          stdSd: num(row.std_sd),
        } satisfies MetaPoint,
      };
    })
    .sort((a, b) => a.order - b.order)
    .map((entry) => entry.point);
  if (meta.length !== PREDICTOR_COUNT) {
    throw new Error(
      `Expected ${PREDICTOR_COUNT} predictors, found ${meta.length}`,
    );
  }
  return meta;
}

interface CoefRecord {
  readonly alfa1: number;
  readonly alfa2: number;
  readonly beta: readonly number[];
}

function buildCoefficients(): ReadonlyMap<string, CoefRecord> {
  const rows = parseCsv(
    readFileSync(
      resolveSourcePath("dashboard_data/model_coefficients.csv"),
      "utf8",
    ),
  );
  const map = new Map<string, CoefRecord>();
  for (const row of rows) {
    const key = `${row.kode_bps}-${row.tahun}`;
    const beta: number[] = [];
    for (let k = 1; k <= PREDICTOR_COUNT; k += 1) {
      beta.push(num(row[`beta${k}`]));
    }
    map.set(key, { alfa1: num(row.alfa1), alfa2: num(row.alfa2), beta });
  }
  return map;
}

interface FixtureCase {
  readonly kodeBps: string;
  readonly tahun: number;
  readonly originalValues: readonly number[];
  readonly coef: CoefRecord;
  readonly expected: {
    readonly category: "Rendah" | "Sedang" | "Tinggi";
    readonly probabilities: readonly [number, number, number];
  };
}

function buildCases(
  coefficients: ReadonlyMap<string, CoefRecord>,
  logger: ScriptLogger,
): readonly FixtureCase[] {
  const rows = parseCsv(
    readFileSync(resolveSourcePath("dashboard_data/observations.csv"), "utf8"),
  );
  const stride = Math.max(1, Math.floor(rows.length / SAMPLE_SIZE));
  const cases: FixtureCase[] = [];
  let skipped = 0;
  rows.forEach((row, index) => {
    if (index % stride !== 0) return;
    const key = `${row.kode_bps}-${row.tahun}`;
    const coef = coefficients.get(key);
    if (coef === undefined) {
      skipped += 1;
      return;
    }
    const category = (row.pred_class_local ?? "").trim();
    if (
      category !== "Rendah" &&
      category !== "Sedang" &&
      category !== "Tinggi"
    ) {
      skipped += 1;
      return;
    }
    const originalValues: number[] = [];
    for (let k = 1; k <= PREDICTOR_COUNT; k += 1) {
      originalValues.push(num(row[`x${k}`]));
    }
    cases.push({
      kodeBps: row.kode_bps ?? "",
      tahun: num(row.tahun),
      originalValues,
      coef,
      expected: {
        category,
        probabilities: [
          num(row.prob_rendah),
          num(row.prob_sedang),
          num(row.prob_tinggi),
        ],
      },
    });
  });
  if (skipped > 0) logger.warn("cases.skipped", { skipped });
  return cases;
}

await runScript("generate-prediction-fixtures", async ({ logger }) => {
  const metaSource = JSON.parse(
    readFileSync(resolveSourcePath("dashboard_data/model_meta.json"), "utf8"),
  ) as { prediction?: { eta_sign?: number } };
  const etaSign = metaSource.prediction?.eta_sign ?? 1;

  const meta = buildMeta();
  const coefficients = buildCoefficients();
  const cases = buildCases(coefficients, logger);

  const outPath = resolve(
    projectRoot(),
    "tests",
    "fixtures",
    "ordinal-prediction-cases.json",
  );
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(
    outPath,
    `${JSON.stringify({ etaSign, meta, cases }, null, 2)}\n`,
    "utf8",
  );
  logger.info("fixtures.written", {
    outPath,
    etaSign,
    predictors: meta.length,
    cases: cases.length,
  });
});
