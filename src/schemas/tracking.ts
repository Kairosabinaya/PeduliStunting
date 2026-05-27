import { z } from "zod";

import type { Tables } from "@/types/supabase";
import { AppErrors, type ValidationError } from "@/domain/errors/app-error";
import { type Result, err, ok } from "@/domain/shared/result";
import {
  asChildId,
  asMeasurementId,
  asUserId,
  isUuid,
  type ChildId,
  type MeasurementId,
  type UserId,
} from "@/domain/shared/ids";
import {
  asDateOnly,
  isDateOnly,
  type DateOnly,
} from "@/domain/shared/date-only";
import { Child } from "@/domain/tracking/entities/child";
import {
  GrowthMeasurement,
  type SdClassMap,
  type ZScoreMap,
} from "@/domain/tracking/entities/growth-measurement";
import {
  GROWTH_INDICATORS,
  type GrowthIndicator,
  isGrowthIndicator,
} from "@/domain/tracking/value-objects/growth-indicator";
import {
  SD_CLASSES,
  type SdClass,
} from "@/domain/tracking/value-objects/sd-classification";
import { SEX_VALUES, type Sex } from "@/domain/tracking/value-objects/sex";

/* ─────────────────────────── input parsing ─────────────────────────── */

export const uuidSchema = z.string().refine(isUuid, "harus UUID v4");

export const userIdSchema = uuidSchema.transform((v): UserId => asUserId(v));
export const childIdSchema = uuidSchema.transform((v): ChildId => asChildId(v));
export const measurementIdSchema = uuidSchema.transform(
  (v): MeasurementId => asMeasurementId(v),
);

export const dateOnlySchema = z
  .string()
  .refine(isDateOnly, "tanggal harus format YYYY-MM-DD")
  .transform((v): DateOnly => asDateOnly(v));

export const sexSchema = z.enum(SEX_VALUES);
export const growthIndicatorSchema = z.enum(GROWTH_INDICATORS);
export const sdClassSchema = z.enum(SD_CLASSES);

/**
 * Server Action payload for creating a child profile. Numeric fields are
 * optional (kosong di KIA banyak orang tua tidak ingat berat lahir).
 */
export const createChildInputSchema = z
  .object({
    name: z.string().min(1).max(80),
    sex: sexSchema,
    birthDate: dateOnlySchema,
    birthWeightKg: z.number().positive().max(10).nullable(),
    birthLengthCm: z.number().positive().max(80).nullable(),
    gestationalAgeWeeks: z.number().int().min(20).max(45).nullable(),
    notes: z.string().max(500).nullable(),
  })
  .strict();

export type CreateChildInput = z.infer<typeof createChildInputSchema>;

/**
 * Server Action payload for recording a growth measurement. The z-score
 * computation happens server-side inside the use case (see
 * AddMeasurementUseCase). The client only sends raw measurements.
 */
export const recordMeasurementInputSchema = z
  .object({
    childId: childIdSchema,
    measuredAt: dateOnlySchema,
    weightKg: z.number().positive().max(60).nullable(),
    heightCm: z.number().positive().max(140).nullable(),
    measuredLying: z.boolean().nullable(),
    headCircumferenceCm: z.number().positive().max(70).nullable(),
    muacCm: z.number().positive().max(40).nullable(),
    note: z.string().max(500).nullable(),
  })
  .strict()
  .refine(
    (input) =>
      input.weightKg !== null ||
      input.heightCm !== null ||
      input.headCircumferenceCm !== null ||
      input.muacCm !== null,
    {
      message: "Minimal satu pengukuran harus diisi.",
    },
  );

export type RecordMeasurementInput = z.infer<typeof recordMeasurementInputSchema>;

/* ─────────────────────────── DB row mappers ─────────────────────────── */

type ChildRow = Tables<"children">;
type GrowthMeasurementRow = Tables<"growth_measurements">;
type GrowthStandardRow = Tables<"growth_standards">;

export function mapChildRow(
  row: ChildRow,
): Result<Child, ValidationError> {
  const sexResult = sexSchema.safeParse(row.sex);
  if (!sexResult.success) {
    return err(AppErrors.validation(`sex tidak valid: ${row.sex}`));
  }
  if (!isDateOnly(row.birth_date)) {
    return err(
      AppErrors.validation(`birth_date tidak valid: ${row.birth_date}`),
    );
  }

  return ok(
    new Child({
      id: asChildId(row.id),
      userId: asUserId(row.user_id),
      name: row.name,
      sex: sexResult.data as Sex,
      birthDate: asDateOnly(row.birth_date),
      birthWeightKg: row.birth_weight_kg,
      birthLengthCm: row.birth_length_cm,
      gestationalAgeWeeks: row.gestational_age_weeks,
      notes: row.notes,
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    }),
  );
}

function parseZScoreMap(value: unknown): ZScoreMap {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const map: ZScoreMap = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!isGrowthIndicator(key)) continue;
    if (typeof raw !== "number" || !Number.isFinite(raw)) continue;
    map[key] = raw;
  }
  return map;
}

function parseSdClassMap(value: unknown): SdClassMap {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const map: SdClassMap = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!isGrowthIndicator(key)) continue;
    if (typeof raw !== "string") continue;
    const parsed = sdClassSchema.safeParse(raw);
    if (!parsed.success) continue;
    map[key] = parsed.data as SdClass;
  }
  return map;
}

export function mapGrowthMeasurementRow(
  row: GrowthMeasurementRow,
): Result<GrowthMeasurement, ValidationError> {
  if (!isDateOnly(row.measured_at)) {
    return err(
      AppErrors.validation(`measured_at tidak valid: ${row.measured_at}`),
    );
  }

  return ok(
    new GrowthMeasurement({
      id: asMeasurementId(row.id),
      userId: asUserId(row.user_id),
      childId: asChildId(row.child_id),
      measuredAt: asDateOnly(row.measured_at),
      weightKg: row.weight_kg,
      heightCm: row.height_cm,
      measuredLying: row.measured_lying,
      headCircumferenceCm: row.head_circumference_cm,
      muacCm: row.muac_cm,
      zScores: parseZScoreMap(row.z_scores),
      sdClass: parseSdClassMap(row.sd_class),
      note: row.note,
    }),
  );
}

/**
 * Used by the GrowthStandardRepository to convert a single WHO LMS row into
 * an {@link LmsParams} VO. The repository handles the lookup-axis difference
 * between age-based and length-based indicators.
 */
export interface GrowthStandardRowParsed {
  readonly indicator: GrowthIndicator;
  readonly sex: Sex;
  readonly ageMonths: number;
  readonly xValue: number;
  readonly l: number;
  readonly m: number;
  readonly s: number;
}

export function parseGrowthStandardRow(
  row: GrowthStandardRow,
): Result<GrowthStandardRowParsed, ValidationError> {
  const sexResult = sexSchema.safeParse(row.sex);
  if (!sexResult.success) {
    return err(AppErrors.validation(`sex tidak valid: ${row.sex}`));
  }
  const indicatorResult = growthIndicatorSchema.safeParse(row.indicator);
  if (!indicatorResult.success) {
    return err(
      AppErrors.validation(`indicator tidak valid: ${row.indicator}`),
    );
  }
  return ok({
    indicator: indicatorResult.data as GrowthIndicator,
    sex: sexResult.data as Sex,
    ageMonths: row.age_months,
    xValue: row.x_value,
    l: row.l,
    m: row.m,
    s: row.s,
  });
}

/* ───────────────── persistence serialisation helpers ──────────────── */

/**
 * Serialise the in-memory `ZScoreMap` into the JSONB shape expected by the
 * `growth_measurements.z_scores` column. Keys are the indicator codes;
 * unset indicators are omitted (not stored as `null`).
 */
export function serialiseZScoreMap(
  map: ZScoreMap,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const indicator of GROWTH_INDICATORS) {
    const value = map[indicator];
    if (typeof value === "number" && Number.isFinite(value)) {
      out[indicator] = value;
    }
  }
  return out;
}

export function serialiseSdClassMap(
  map: SdClassMap,
): Record<string, SdClass> {
  const out: Record<string, SdClass> = {};
  for (const indicator of GROWTH_INDICATORS) {
    const value = map[indicator];
    if (value !== undefined) {
      out[indicator] = value;
    }
  }
  return out;
}
