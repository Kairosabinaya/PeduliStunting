/**
 * import-who-standards — populate the `growth_standards` table with the
 * WHO Child Growth Standards LMS parameters for ages 0-60 months.
 *
 * Indicators covered (per Permenkes No. 2/2020 + Buku KIA 2024):
 *   - BB_U  weight-for-age          (axis: month, 0-60)
 *   - TB_U  length/height-for-age   (axis: month, 0-60)
 *   - BB_TB weight-for-length/height (axis: cm)
 *   - LK_U  head-circumference-for-age (axis: month, 0-60)
 *
 * Source: https://www.who.int/tools/child-growth-standards/standards
 *
 * The script reads from `docs/source/who-standards/`. Each indicator is
 * provided as one TSV (tab-separated values) file covering BOTH sexes:
 *
 *   docs/source/who-standards/who-lms-bb-u.tsv
 *   docs/source/who-standards/who-lms-tb-u.tsv
 *   docs/source/who-standards/who-lms-bb-tb.tsv
 *   docs/source/who-standards/who-lms-lk-u.tsv
 *
 * Required column header (first line, exact spelling, tab-separated):
 *
 *   sex	axis_value	axis_unit	L	M	S
 *
 * Where:
 *   - sex        = "L" (laki-laki) or "P" (perempuan)
 *   - axis_value = number (month for age-based, cm for length/height-based)
 *   - axis_unit  = "month" or "cm" (must match the indicator's axis)
 *   - L, M, S    = WHO LMS parameters (numeric)
 *
 * Run with:
 *   pnpm import:who-standards
 *
 * The script is idempotent: re-running upserts on the natural primary key
 * (indicator, sex, age_months, x_value).
 *
 * Use `--dry-run` (or env `DRY_RUN=1`) to parse and validate without writing.
 *
 * See README.md "WHO Growth Standards" section for download instructions.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { z } from "zod";

import {
  createScriptAdminClient,
  projectRoot,
  runScript,
  type ScriptLogger,
} from "./_lib/script-context.ts";

const WHO_STANDARDS_DIR = "docs/source/who-standards";

const UPSERT_BATCH_SIZE = 500;

const MAX_AGE_MONTHS = 60;

const INDICATORS = ["BB_U", "TB_U", "BB_TB", "LK_U"] as const;

type IndicatorCode = (typeof INDICATORS)[number];

interface IndicatorSpec {
  readonly code: IndicatorCode;
  readonly axisUnit: "month" | "cm";
  readonly fileName: string;
  readonly minAxis: number;
  readonly maxAxis: number;
}

const INDICATOR_SPECS: readonly IndicatorSpec[] = [
  {
    code: "BB_U",
    axisUnit: "month",
    fileName: "who-lms-bb-u.tsv",
    minAxis: 0,
    maxAxis: MAX_AGE_MONTHS,
  },
  {
    code: "TB_U",
    axisUnit: "month",
    fileName: "who-lms-tb-u.tsv",
    minAxis: 0,
    maxAxis: MAX_AGE_MONTHS,
  },
  {
    code: "BB_TB",
    axisUnit: "cm",
    fileName: "who-lms-bb-tb.tsv",
    minAxis: 40,
    maxAxis: 130,
  },
  {
    code: "LK_U",
    axisUnit: "month",
    fileName: "who-lms-lk-u.tsv",
    minAxis: 0,
    maxAxis: MAX_AGE_MONTHS,
  },
];

const REQUIRED_HEADERS = [
  "sex",
  "axis_value",
  "axis_unit",
  "L",
  "M",
  "S",
] as const;

const RowSchema = z.object({
  sex: z.enum(["L", "P"]),
  axis_value: z.number().finite().min(0),
  axis_unit: z.enum(["month", "cm"]),
  L: z.number().finite(),
  M: z.number().finite().positive(),
  S: z.number().finite().positive(),
});

type ParsedRow = z.infer<typeof RowSchema>;

interface InsertRow {
  readonly indicator: IndicatorCode;
  readonly sex: "L" | "P";
  readonly age_months: number;
  readonly x_value: number;
  readonly l: number;
  readonly m: number;
  readonly s: number;
  readonly source: string;
}

function isDryRun(): boolean {
  if (process.env.DRY_RUN === "1") return true;
  return process.argv.includes("--dry-run");
}

function whoStandardsPath(fileName: string): string {
  return resolve(projectRoot(), WHO_STANDARDS_DIR, fileName);
}

function parseNumber(value: string): number {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return Number.NaN;
  }
  const normalised = trimmed.replace(",", ".");
  const parsed = Number(normalised);
  return parsed;
}

function parseTsvFile(
  filePath: string,
  logger: ScriptLogger,
): readonly ParsedRow[] {
  const raw = readFileSync(filePath, "utf-8");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const firstLine = lines[0];
  if (firstLine === undefined) {
    throw new Error(`Empty file: ${filePath}`);
  }
  const header = firstLine.split("\t").map((cell) => cell.trim());
  const missing = REQUIRED_HEADERS.filter((name) => !header.includes(name));
  if (missing.length > 0) {
    throw new Error(
      `File ${filePath} missing required header columns: ${missing.join(", ")}. ` +
        `Got: ${header.join(", ")}`,
    );
  }
  const columnIndex = (name: string): number => {
    const index = header.indexOf(name);
    if (index < 0) {
      throw new Error(`Column "${name}" not found after validation.`);
    }
    return index;
  };
  const sexIdx = columnIndex("sex");
  const axisValueIdx = columnIndex("axis_value");
  const axisUnitIdx = columnIndex("axis_unit");
  const lIdx = columnIndex("L");
  const mIdx = columnIndex("M");
  const sIdx = columnIndex("S");

  const rows: ParsedRow[] = [];
  let invalidLineCount = 0;
  for (let lineNo = 1; lineNo < lines.length; lineNo += 1) {
    const rawLine = lines[lineNo];
    if (rawLine === undefined) continue;
    const cells = rawLine.split("\t");
    if (cells.length < header.length) {
      invalidLineCount += 1;
      continue;
    }
    const candidate = {
      sex: cells[sexIdx]?.trim() ?? "",
      axis_value: parseNumber(cells[axisValueIdx] ?? ""),
      axis_unit: cells[axisUnitIdx]?.trim() ?? "",
      L: parseNumber(cells[lIdx] ?? ""),
      M: parseNumber(cells[mIdx] ?? ""),
      S: parseNumber(cells[sIdx] ?? ""),
    };
    const parsed = RowSchema.safeParse(candidate);
    if (!parsed.success) {
      invalidLineCount += 1;
      continue;
    }
    rows.push(parsed.data);
  }
  if (invalidLineCount > 0) {
    logger.warn("tsv.invalid_rows_skipped", {
      file: filePath,
      invalidLineCount,
      validRows: rows.length,
    });
  }
  return rows;
}

function toInsertRows(
  spec: IndicatorSpec,
  rows: readonly ParsedRow[],
): readonly InsertRow[] {
  const result: InsertRow[] = [];
  for (const row of rows) {
    if (row.axis_unit !== spec.axisUnit) {
      continue;
    }
    if (row.axis_value < spec.minAxis || row.axis_value > spec.maxAxis) {
      continue;
    }
    if (spec.axisUnit === "month") {
      if (!Number.isInteger(row.axis_value)) {
        continue;
      }
      result.push({
        indicator: spec.code,
        sex: row.sex,
        age_months: row.axis_value,
        x_value: 0,
        l: row.L,
        m: row.M,
        s: row.S,
        source: "WHO Child Growth Standards",
      });
    } else {
      result.push({
        indicator: spec.code,
        sex: row.sex,
        age_months: 0,
        x_value: row.axis_value,
        l: row.L,
        m: row.M,
        s: row.S,
        source: "WHO Child Growth Standards",
      });
    }
  }
  return result;
}

async function upsertBatch(
  client: ReturnType<typeof createScriptAdminClient>,
  rows: readonly InsertRow[],
  logger: ScriptLogger,
): Promise<void> {
  for (let offset = 0; offset < rows.length; offset += UPSERT_BATCH_SIZE) {
    const batch = rows.slice(offset, offset + UPSERT_BATCH_SIZE);
    const { error } = await client
      .from("growth_standards")
      .upsert(batch as InsertRow[], {
        onConflict: "indicator,sex,age_months,x_value",
      });
    if (error) {
      throw new Error(
        `growth_standards upsert failed at offset=${offset}: ${error.message}`,
      );
    }
    logger.info("growth_standards.batch.upserted", {
      offset,
      size: batch.length,
    });
  }
}

await runScript("import-who-standards", async ({ logger }) => {
  const dryRun = isDryRun();
  if (dryRun) {
    logger.info("dryrun.enabled");
  }

  let totalParsed = 0;
  const allRows: InsertRow[] = [];

  for (const spec of INDICATOR_SPECS) {
    const filePath = whoStandardsPath(spec.fileName);
    if (!existsSync(filePath)) {
      logger.warn("indicator.file.missing", {
        indicator: spec.code,
        expectedPath: filePath,
        hint: "Download the WHO Child Growth Standards LMS tables, transform to the TSV format documented in README.md, and place at this path.",
      });
      continue;
    }
    const parsed = parseTsvFile(filePath, logger);
    totalParsed += parsed.length;
    const inserts = toInsertRows(spec, parsed);
    logger.info("indicator.parsed", {
      indicator: spec.code,
      file: spec.fileName,
      parsedRows: parsed.length,
      insertRows: inserts.length,
    });
    allRows.push(...inserts);
  }

  if (allRows.length === 0) {
    throw new Error(
      "No WHO LMS rows produced. Verify files exist under " +
        `${WHO_STANDARDS_DIR}/ and use the documented TSV format.`,
    );
  }

  if (dryRun) {
    logger.info("dryrun.summary", {
      totalParsed,
      totalInserts: allRows.length,
      indicators: INDICATORS,
    });
    return;
  }

  const client = createScriptAdminClient();
  await upsertBatch(client, allRows, logger);

  const { count, error } = await client
    .from("growth_standards")
    .select("indicator", { count: "exact", head: true });
  if (error) {
    logger.warn("growth_standards.count.failed", { error: error.message });
  } else {
    logger.info("growth_standards.total", { count });
  }
});
