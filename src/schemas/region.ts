import { z } from "zod";

import type { Tables } from "@/types/supabase";
import { AppErrors, type ValidationError } from "@/domain/errors/app-error";
import { type Result, err, ok } from "@/domain/shared/result";
import { type IndicatorCode, asIndicatorCode } from "@/domain/shared/ids";
import { IndicatorDefinition } from "@/domain/region/entities/indicator-definition";
import {
  EFFECT_DIRECTIONS,
  INDICATOR_DIMENSIONS,
  MODEL_DIMENSIONS,
  PREDICTOR_TRANSFORMS,
  type EffectDirection,
  type IndicatorDimension,
  type ModelDimension,
  type PredictorModelMeta,
  type PredictorTransform,
} from "@/domain/region/entities/indicator-definition";
import { Region, type RegionType } from "@/domain/region/entities/region";
import { RegionBoundary } from "@/domain/region/entities/region-boundary";
import { RegionIndicators } from "@/domain/region/entities/region-indicators";
import {
  type KodeBps,
  asKodeBps,
} from "@/domain/region/value-objects/kode-bps";
import {
  STUNTING_CATEGORIES,
  type StuntingCategory,
} from "@/domain/region/value-objects/stunting-category";
import { type Year, asYear } from "@/domain/region/value-objects/year";

/* ─────────────────────────── input parsing ─────────────────────────── */

export const kodeBpsSchema = z
  .string()
  .regex(/^\d{4}$/u, "kode_bps harus terdiri dari 4 digit angka")
  .transform((value): KodeBps => asKodeBps(value));

export const yearSchema = z
  .number()
  .int()
  .min(2000)
  .max(2100)
  .transform((value): Year => asYear(value));

export const indicatorCodeSchema = z
  .string()
  .min(1)
  .max(64)
  .transform((value): IndicatorCode => asIndicatorCode(value));

export const stuntingCategorySchema = z.enum(STUNTING_CATEGORIES);

export const regionTypeSchema = z.enum(["Kabupaten", "Kota"]);

export const indicatorDimensionSchema = z.enum(INDICATOR_DIMENSIONS);

export const effectDirectionSchema = z.enum(EFFECT_DIRECTIONS);

export const modelDimensionSchema = z.enum(MODEL_DIMENSIONS);

export const predictorTransformSchema = z.enum(PREDICTOR_TRANSFORMS);

/* ─────────────────────────── DB row mappers ─────────────────────────── */

type RegionRow = Tables<"regions">;
type RegionIndicatorsRow = Tables<"region_indicators">;
type RegionBoundaryRow = Tables<"region_boundaries">;
type IndicatorDictionaryRow = Tables<"indicator_dictionary">;

/**
 * Predictor columns on `region_indicators`. Keeping them here as a typed
 * tuple is the single source of truth that callers must use when reading
 * predictor values from the DB row; the `predictors` Map is then keyed by
 * the canonical indicator code, not by `x1..x20` strings.
 */
const PREDICTOR_COLUMNS = [
  "x1",
  "x2",
  "x3",
  "x4",
  "x5",
  "x6",
  "x7",
  "x8",
  "x9",
  "x10",
  "x11",
  "x12",
  "x13",
  "x14",
  "x15",
  "x16",
  "x17",
  "x18",
  "x19",
  "x20",
] as const;

type PredictorColumn = (typeof PREDICTOR_COLUMNS)[number];

export function mapRegionRow(row: RegionRow): Result<Region, ValidationError> {
  const tipeResult = regionTypeSchema.safeParse(row.tipe);
  if (!tipeResult.success) {
    return err(AppErrors.validation(`Region tipe tidak valid: ${row.tipe}`));
  }
  return ok(
    new Region({
      kodeBps: asKodeBps(row.kode_bps),
      provinsi: row.provinsi,
      kabupatenKota: row.kabupaten_kota,
      tipe: tipeResult.data as RegionType,
      latitude: row.latitude,
      longitude: row.longitude,
    }),
  );
}

export function mapRegionIndicatorsRow(
  row: RegionIndicatorsRow,
): Result<RegionIndicators, ValidationError> {
  const yearResult = yearSchema.safeParse(row.tahun);
  if (!yearResult.success) {
    return err(AppErrors.validation(`tahun tidak valid: ${row.tahun}`));
  }
  const categoryResult = stuntingCategorySchema.safeParse(row.y_category);
  if (!categoryResult.success) {
    return err(
      AppErrors.validation(`y_category tidak valid: ${row.y_category}`),
    );
  }

  const predictors = new Map<IndicatorCode, number | null>();
  for (const column of PREDICTOR_COLUMNS) {
    const value = row[column as PredictorColumn];
    predictors.set(asIndicatorCode(column), value);
  }

  return ok(
    new RegionIndicators({
      kodeBps: asKodeBps(row.kode_bps),
      tahun: yearResult.data,
      yCategory: categoryResult.data as StuntingCategory,
      y1Prevalence: row.y1_prevalence,
      predictors,
    }),
  );
}

export function mapRegionBoundaryRow(
  row: RegionBoundaryRow,
): Result<RegionBoundary, ValidationError> {
  return ok(
    new RegionBoundary({
      kodeBps: asKodeBps(row.kode_bps),
      geometry: row.geometry,
      simplificationTolerance: row.simplification_tolerance,
      source: row.source,
    }),
  );
}

export function mapIndicatorDictionaryRow(
  row: IndicatorDictionaryRow,
): Result<IndicatorDefinition, ValidationError> {
  const dimensionResult = indicatorDimensionSchema.safeParse(row.dimension);
  if (!dimensionResult.success) {
    return err(AppErrors.validation(`dimension tidak valid: ${row.dimension}`));
  }

  let effectDirection: EffectDirection | null = null;
  if (row.effect_direction !== null) {
    const parsed = effectDirectionSchema.safeParse(row.effect_direction);
    if (!parsed.success) {
      return err(
        AppErrors.validation(
          `effect_direction tidak valid: ${row.effect_direction}`,
        ),
      );
    }
    effectDirection = parsed.data as EffectDirection;
  }

  const transform: PredictorTransform | null =
    row.transform !== null &&
    predictorTransformSchema.safeParse(row.transform).success
      ? (row.transform as PredictorTransform)
      : null;
  const modelDimension: ModelDimension | null =
    row.model_dimension !== null &&
    modelDimensionSchema.safeParse(row.model_dimension).success
      ? (row.model_dimension as ModelDimension)
      : null;
  const model: PredictorModelMeta = {
    transform,
    stdMean: row.std_mean,
    stdSd: row.std_sd,
    origMin: row.orig_min,
    origMax: row.orig_max,
    origP5: row.orig_p5,
    origP50: row.orig_p50,
    origP95: row.orig_p95,
    pctActive: row.pct_active,
    pctPositive: row.pct_positive,
    medianCoef: row.median_coef,
    corPrevalence: row.cor_prevalence,
    modelDimension,
    displayOrder: row.display_order,
  };

  return ok(
    new IndicatorDefinition({
      code: asIndicatorCode(row.code),
      dimension: dimensionResult.data as IndicatorDimension,
      name: row.name,
      description: row.description,
      unit: row.unit,
      sourceLabel: row.source_label,
      sourceUrl: row.source_url,
      effectDirection,
      model,
    }),
  );
}
