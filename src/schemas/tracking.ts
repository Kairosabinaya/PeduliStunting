import { z } from "zod";

import {
  TRACKER_FIELD_LIMITS,
  TRACKER_VALIDATION_COPY,
} from "@/config/tracker";
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

/* ─────────────────────────── helpers ─────────────────────────── */

function getSafeMaxDate(): string {
  const d = new Date();

  // Di client (browser), gunakan zona waktu lokal user secara persis
  if (typeof window !== "undefined") {
    const yyyy = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const dd = d.getDate().toString().padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Di server, gunakan UTC+14 untuk mengakomodasi timezone paling depan (misal Kiribati)
  // agar server tidak me-reject 'hari ini' dari user Asia saat di server (UTC) masih 'kemarin'.
  d.setUTCHours(d.getUTCHours() + 14);
  const yyyy = d.getUTCFullYear();
  const mm = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  const dd = d.getUTCDate().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const DECIMAL_INPUT_RE = /^-?\d+(?:[.,]\d+)?$/u;
const INTEGER_INPUT_RE = /^-?\d+$/u;

interface NumericFieldLimits {
  readonly min: number;
  readonly max: number;
}

function optionalDecimalInputSchema(
  label: string,
  unit: string,
  limits: NumericFieldLimits,
) {
  return z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || DECIMAL_INPUT_RE.test(value),
      TRACKER_VALIDATION_COPY.malformedNumber,
    )
    .transform((value): number | null =>
      value.length === 0 ? null : Number(value.replace(",", ".")),
    )
    .refine(
      (value) =>
        value === null ||
        (Number.isFinite(value) && value >= limits.min && value <= limits.max),
      TRACKER_VALIDATION_COPY.rangeFormat(label, limits.min, limits.max, unit),
    );
}

function optionalIntegerInputSchema(
  label: string,
  unit: string,
  limits: NumericFieldLimits,
) {
  return z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || INTEGER_INPUT_RE.test(value),
      TRACKER_VALIDATION_COPY.integer,
    )
    .transform((value): number | null =>
      value.length === 0 ? null : Number(value),
    )
    .refine(
      (value) =>
        value === null ||
        (Number.isInteger(value) && value >= limits.min && value <= limits.max),
      TRACKER_VALIDATION_COPY.rangeFormat(label, limits.min, limits.max, unit),
    );
}

function requiredDateInputSchema(futureMessage: string) {
  return z
    .string()
    .trim()
    .min(1, TRACKER_VALIDATION_COPY.required)
    .refine(isDateOnly, TRACKER_VALIDATION_COPY.invalidDate)
    .transform((value): DateOnly => asDateOnly(value))
    .refine((date) => date <= getSafeMaxDate(), futureMessage);
}

const sexFormInputSchema = z
  .enum(["", ...SEX_VALUES], { error: TRACKER_VALIDATION_COPY.required })
  .refine((value): value is Sex => value !== "", {
    message: TRACKER_VALIDATION_COPY.required,
  });

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
    name: z.string().min(1).max(TRACKER_FIELD_LIMITS.childNameMaxLength),
    sex: z.enum(SEX_VALUES, { error: TRACKER_VALIDATION_COPY.required }),
    birthDate: dateOnlySchema.refine(
      (d) => d <= getSafeMaxDate(),
      TRACKER_VALIDATION_COPY.birthDateFuture,
    ),
    birthWeightKg: z
      .number()
      .min(TRACKER_FIELD_LIMITS.birthWeightKg.min)
      .max(TRACKER_FIELD_LIMITS.birthWeightKg.max)
      .nullable(),
    birthLengthCm: z
      .number()
      .min(TRACKER_FIELD_LIMITS.birthLengthCm.min)
      .max(TRACKER_FIELD_LIMITS.birthLengthCm.max)
      .nullable(),
    /**
     * Whether the child was born preterm (< 37 weeks). Drives whether the
     * gestational-age-at-birth figure is required: term babies do not carry
     * one, preterm babies must record it.
     */
    isPremature: z.boolean(),
    gestationalAgeWeeks: z
      .number()
      .int()
      .min(TRACKER_FIELD_LIMITS.gestationalAgeWeeks.min)
      .max(TRACKER_FIELD_LIMITS.gestationalAgeWeeks.max)
      .nullable(),
    notes: z.string().max(TRACKER_FIELD_LIMITS.noteMaxLength).nullable(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!value.isPremature) return;
    if (value.gestationalAgeWeeks === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gestationalAgeWeeks"],
        message:
          "Isi usia kehamilan saat lahir untuk anak yang lahir prematur.",
      });
      return;
    }
    if (value.gestationalAgeWeeks >= 37) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gestationalAgeWeeks"],
        message: "Lahir prematur berarti usia kehamilan kurang dari 37 minggu.",
      });
    }
  });

export type CreateChildInput = z.infer<typeof createChildInputSchema>;

export const childFormInputSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, TRACKER_VALIDATION_COPY.required)
      .max(
        TRACKER_FIELD_LIMITS.childNameMaxLength,
        TRACKER_VALIDATION_COPY.maxLengthFormat(
          "Nama anak",
          TRACKER_FIELD_LIMITS.childNameMaxLength,
        ),
      ),
    sex: sexFormInputSchema,
    birthDate: requiredDateInputSchema(TRACKER_VALIDATION_COPY.birthDateFuture),
    birthWeightKg: optionalDecimalInputSchema(
      "Berat lahir",
      "kg",
      TRACKER_FIELD_LIMITS.birthWeightKg,
    ),
    birthLengthCm: optionalDecimalInputSchema(
      "Panjang lahir",
      "cm",
      TRACKER_FIELD_LIMITS.birthLengthCm,
    ),
    birthStatus: z.enum(["term", "preterm"], {
      error: TRACKER_VALIDATION_COPY.required,
    }),
    gestationalAgeWeeks: optionalIntegerInputSchema(
      "Usia kehamilan saat lahir",
      "minggu",
      TRACKER_FIELD_LIMITS.gestationalAgeWeeks,
    ),
    notes: z
      .string()
      .trim()
      .max(
        TRACKER_FIELD_LIMITS.noteMaxLength,
        TRACKER_VALIDATION_COPY.maxLengthFormat(
          "Catatan",
          TRACKER_FIELD_LIMITS.noteMaxLength,
        ),
      )
      .transform((value): string | null => (value.length === 0 ? null : value)),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.birthStatus !== "preterm") return;
    if (value.gestationalAgeWeeks === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gestationalAgeWeeks"],
        message:
          "Isi usia kehamilan saat lahir untuk anak yang lahir prematur.",
      });
      return;
    }
    if (value.gestationalAgeWeeks >= 37) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gestationalAgeWeeks"],
        message: "Lahir prematur berarti usia kehamilan kurang dari 37 minggu.",
      });
    }
  });

export type ChildFormInput = z.infer<typeof childFormInputSchema>;

/**
 * Server Action payload for recording a growth measurement. The z-score
 * computation happens server-side inside the use case (see
 * AddMeasurementUseCase). The client only sends raw measurements.
 */
export const recordMeasurementInputSchema = z
  .object({
    childId: childIdSchema,
    measuredAt: dateOnlySchema.refine(
      (d) => d <= getSafeMaxDate(),
      TRACKER_VALIDATION_COPY.futureDate,
    ),
    weightKg: z
      .number()
      .min(TRACKER_FIELD_LIMITS.measurementWeightKg.min)
      .max(TRACKER_FIELD_LIMITS.measurementWeightKg.max)
      .nullable(),
    heightCm: z
      .number()
      .min(TRACKER_FIELD_LIMITS.measurementHeightCm.min)
      .max(TRACKER_FIELD_LIMITS.measurementHeightCm.max)
      .nullable(),
    measuredLying: z.boolean().nullable(),
    headCircumferenceCm: z
      .number()
      .min(TRACKER_FIELD_LIMITS.measurementHeadCircumferenceCm.min)
      .max(TRACKER_FIELD_LIMITS.measurementHeadCircumferenceCm.max)
      .nullable(),
    muacCm: z
      .number()
      .min(TRACKER_FIELD_LIMITS.measurementMuacCm.min)
      .max(TRACKER_FIELD_LIMITS.measurementMuacCm.max)
      .nullable(),
    note: z.string().max(TRACKER_FIELD_LIMITS.noteMaxLength).nullable(),
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

export type RecordMeasurementInput = z.infer<
  typeof recordMeasurementInputSchema
>;

export const recordMeasurementFormInputSchema = z
  .object({
    childId: childIdSchema,
    childBirthDate: dateOnlySchema,
    measuredAt: requiredDateInputSchema(TRACKER_VALIDATION_COPY.futureDate),
    weightKg: optionalDecimalInputSchema(
      "Berat badan",
      "kg",
      TRACKER_FIELD_LIMITS.measurementWeightKg,
    ),
    heightCm: optionalDecimalInputSchema(
      "Tinggi/panjang badan",
      "cm",
      TRACKER_FIELD_LIMITS.measurementHeightCm,
    ),
    headCircumferenceCm: optionalDecimalInputSchema(
      "Lingkar kepala",
      "cm",
      TRACKER_FIELD_LIMITS.measurementHeadCircumferenceCm,
    ),
    muacCm: optionalDecimalInputSchema(
      "LiLA",
      "cm",
      TRACKER_FIELD_LIMITS.measurementMuacCm,
    ),
    note: z
      .string()
      .trim()
      .max(
        TRACKER_FIELD_LIMITS.noteMaxLength,
        TRACKER_VALIDATION_COPY.maxLengthFormat(
          "Catatan",
          TRACKER_FIELD_LIMITS.noteMaxLength,
        ),
      )
      .transform((value): string | null => (value.length === 0 ? null : value)),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.measuredAt < value.childBirthDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["measuredAt"],
        message: TRACKER_VALIDATION_COPY.measurementBeforeBirth,
      });
    }
    if (
      value.weightKg === null &&
      value.heightCm === null &&
      value.headCircumferenceCm === null &&
      value.muacCm === null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["weightKg"],
        message: TRACKER_VALIDATION_COPY.atLeastOneMeasurement,
      });
    }
  });

export type RecordMeasurementFormInput = z.infer<
  typeof recordMeasurementFormInputSchema
>;

/* ─────────────────────────── DB row mappers ─────────────────────────── */

type ChildRow = Tables<"children">;
type GrowthMeasurementRow = Tables<"growth_measurements">;
type GrowthStandardRow = Tables<"growth_standards">;

export function mapChildRow(row: ChildRow): Result<Child, ValidationError> {
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
    return err(AppErrors.validation(`indicator tidak valid: ${row.indicator}`));
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
export function serialiseZScoreMap(map: ZScoreMap): Record<string, number> {
  const out: Record<string, number> = {};
  for (const indicator of GROWTH_INDICATORS) {
    const value = map[indicator];
    if (typeof value === "number" && Number.isFinite(value)) {
      out[indicator] = value;
    }
  }
  return out;
}

export function serialiseSdClassMap(map: SdClassMap): Record<string, SdClass> {
  const out: Record<string, SdClass> = {};
  for (const indicator of GROWTH_INDICATORS) {
    const value = map[indicator];
    if (value !== undefined) {
      out[indicator] = value;
    }
  }
  return out;
}
