import { z } from "zod";

import type { Tables } from "@/types/supabase";
import { AppErrors, type ValidationError } from "@/domain/errors/app-error";
import { type Result, err, ok } from "@/domain/shared/result";
import {
  type ModelVersion,
  asModelVersion,
} from "@/domain/shared/ids";
import { LocalCoefficient } from "@/domain/model/entities/local-coefficient";
import { ModelMetadata } from "@/domain/model/entities/model-metadata";
import { ModelPrediction } from "@/domain/model/entities/model-prediction";
import { ClassProbabilities } from "@/domain/model/value-objects/class-probabilities";
import { asIndicatorCode } from "@/domain/shared/ids";
import { asKodeBps } from "@/domain/region/value-objects/kode-bps";
import {
  STUNTING_CATEGORIES,
  type StuntingCategory,
} from "@/domain/region/value-objects/stunting-category";
import { yearSchema } from "./region";

/* ─────────────────────────── input parsing ─────────────────────────── */

export const modelVersionSchema = z
  .string()
  .min(1)
  .max(64)
  .transform((value): ModelVersion => asModelVersion(value));

export const predictedCategorySchema = z.enum(STUNTING_CATEGORIES);

/* ─────────────────────────── DB row mappers ─────────────────────────── */

type ModelMetadataRow = Tables<"model_metadata">;
type ModelPredictionRow = Tables<"model_predictions">;
type ModelCoefficientRow = Tables<"model_coefficients">;

function toReadonlyRecord(
  value: unknown,
  fallback: Readonly<Record<string, unknown>>,
): Readonly<Record<string, unknown>> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return fallback;
  }
  return value as Readonly<Record<string, unknown>>;
}

export function mapModelMetadataRow(
  row: ModelMetadataRow,
): Result<ModelMetadata, ValidationError> {
  return ok(
    new ModelMetadata({
      version: asModelVersion(row.version),
      name: row.name,
      hyperparameters: toReadonlyRecord(row.hyperparameters, {}),
      metrics: toReadonlyRecord(row.metrics, {}),
      moranPerYear: toReadonlyRecord(row.moran_per_year, {}),
      notes: row.notes,
      isDefault: row.is_default,
    }),
  );
}

export function mapModelPredictionRow(
  row: ModelPredictionRow,
): Result<ModelPrediction, ValidationError> {
  const yearResult = yearSchema.safeParse(row.tahun);
  if (!yearResult.success) {
    return err(AppErrors.validation(`tahun tidak valid: ${row.tahun}`));
  }
  const categoryResult = predictedCategorySchema.safeParse(
    row.predicted_category,
  );
  if (!categoryResult.success) {
    return err(
      AppErrors.validation(
        `predicted_category tidak valid: ${row.predicted_category}`,
      ),
    );
  }

  return ok(
    new ModelPrediction({
      modelVersion: asModelVersion(row.model_version),
      kodeBps: asKodeBps(row.kode_bps),
      tahun: yearResult.data,
      predictedCategory: categoryResult.data as StuntingCategory,
      probabilities: new ClassProbabilities({
        rendah: row.prob_rendah,
        sedang: row.prob_sedang,
        tinggi: row.prob_tinggi,
      }),
    }),
  );
}

export function mapModelCoefficientRow(
  row: ModelCoefficientRow,
): Result<LocalCoefficient, ValidationError> {
  const yearResult = yearSchema.safeParse(row.tahun);
  if (!yearResult.success) {
    return err(AppErrors.validation(`tahun tidak valid: ${row.tahun}`));
  }

  return ok(
    new LocalCoefficient({
      modelVersion: asModelVersion(row.model_version),
      kodeBps: asKodeBps(row.kode_bps),
      tahun: yearResult.data,
      predictorCode: asIndicatorCode(row.predictor_code),
      coefficient: row.coefficient,
      se: row.se,
      isInference: row.is_inference,
    }),
  );
}

/* ─────────────────── metric / moran JSON-payload parsing ─────────────────── */

const numericLike = z.union([z.number(), z.string()]).transform((value) => {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
});

const finiteNumber = numericLike.pipe(z.number().finite());

/**
 * Loose representation of one candidate model entry inside
 * `model_metadata.metrics.models`. Any non-numeric / out-of-shape field is
 * skipped silently — the dashboard then collapses to an empty state when no
 * entry survives parsing.
 */
export const modelComparisonEntrySchema = z
  .object({
    name: z.string().min(1).max(120),
    accuracy: finiteNumber.optional(),
    qwk: finiteNumber.optional(),
    mae: finiteNumber.optional(),
    log_score: finiteNumber.optional(),
    is_selected: z.boolean().optional(),
    notes: z.string().max(280).optional(),
  })
  .passthrough();

export type ModelComparisonEntry = z.infer<typeof modelComparisonEntrySchema>;

/** Shape of `model_metadata.metrics`. All members are optional. */
export const modelMetricsPayloadSchema = z
  .object({
    accuracy: finiteNumber.optional(),
    qwk: finiteNumber.optional(),
    mae: finiteNumber.optional(),
    log_score: finiteNumber.optional(),
    models: z.array(modelComparisonEntrySchema).optional(),
  })
  .passthrough();

export type ModelMetricsPayload = z.infer<typeof modelMetricsPayloadSchema>;

const moranYearKeySchema = z
  .string()
  .regex(/^\d{4}$/u, "year key must be 4-digit string");

const moranEntrySchema = z
  .object({
    moran_i: finiteNumber.optional(),
    value: finiteNumber.optional(),
    p_value: finiteNumber.optional(),
    z_score: finiteNumber.optional(),
  })
  .passthrough();

export interface MoranYearPoint {
  readonly year: number;
  readonly moranI: number;
  readonly pValue: number | null;
}

/**
 * Parse the free-form `model_metadata.moran_per_year` JSON into a stable list
 * of `{ year, moranI, pValue }` tuples. Two on-disk shapes are accepted:
 *
 * 1. `{ "2021": 0.18, "2022": 0.12 }`
 * 2. `{ "2021": { moran_i: 0.18, p_value: 0.01 }, ... }`
 *
 * Unknown keys / non-numeric values are skipped; the resulting list is sorted
 * ascending by year so charts render chronologically.
 */
export function parseMoranPerYear(
  raw: Readonly<Record<string, unknown>>,
): readonly MoranYearPoint[] {
  const out: MoranYearPoint[] = [];
  for (const [key, value] of Object.entries(raw)) {
    const keyResult = moranYearKeySchema.safeParse(key);
    if (!keyResult.success) continue;
    const year = Number(keyResult.data);

    if (typeof value === "number" && Number.isFinite(value)) {
      out.push({ year, moranI: value, pValue: null });
      continue;
    }
    const entryResult = moranEntrySchema.safeParse(value);
    if (!entryResult.success) continue;
    const moran =
      entryResult.data.moran_i ?? entryResult.data.value ?? null;
    if (moran === null || !Number.isFinite(moran)) continue;
    out.push({
      year,
      moranI: moran,
      pValue: entryResult.data.p_value ?? null,
    });
  }
  return out.sort((a, b) => a.year - b.year);
}
