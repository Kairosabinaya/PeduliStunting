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
  asChildImmunizationId,
  asChildMilestoneId,
  asImmunizationCode,
  asMilestoneId,
  asNutritionEventId,
  asUserId,
  type ImmunizationCode,
} from "@/domain/shared/ids";
import { asDateOnly, isDateOnly } from "@/domain/shared/date-only";
import {
  CHILD_IMMUNIZATION_STATUSES,
  ChildImmunization,
  type ChildImmunizationStatus,
} from "@/domain/health-plan/entities/child-immunization";
import {
  CHILD_MILESTONE_STATUSES,
  ChildMilestone,
  type ChildMilestoneStatus,
} from "@/domain/health-plan/entities/child-milestone";
import { Immunization } from "@/domain/health-plan/entities/immunization";
import {
  MILESTONE_DOMAINS,
  Milestone,
  type MilestoneDomain,
} from "@/domain/health-plan/entities/milestone";
import {
  NUTRITION_EVENT_KINDS,
  NutritionEvent,
  type NutritionEventData,
  type NutritionEventKind,
} from "@/domain/health-plan/entities/nutrition-event";
import { childIdSchema, dateOnlySchema } from "./tracking";

function getSafeMaxDate(): string {
  const d = new Date();
  if (typeof window !== "undefined") {
    const yyyy = d.getFullYear().toString().padStart(4, "0");
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const dd = d.getDate().toString().padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  d.setUTCHours(d.getUTCHours() + 14);
  const yyyy = d.getUTCFullYear().toString().padStart(4, "0");
  const mm = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  const dd = d.getUTCDate().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const dateOnlyNotFutureSchema = dateOnlySchema.refine(
  (date) => date <= getSafeMaxDate(),
  TRACKER_VALIDATION_COPY.futureDate,
);

/* ─────────────────────────── input parsing ─────────────────────────── */

export const immunizationCodeSchema = z
  .string()
  .min(1)
  .max(64)
  .transform((v): ImmunizationCode => asImmunizationCode(v));

export const childImmunizationStatusSchema = z.enum(
  CHILD_IMMUNIZATION_STATUSES,
);

export const childMilestoneStatusSchema = z.enum(CHILD_MILESTONE_STATUSES);

export const milestoneDomainSchema = z.enum(MILESTONE_DOMAINS);

export const upsertChildImmunizationInputSchema = z
  .object({
    childId: childIdSchema,
    childBirthDate: dateOnlySchema.optional(),
    immunizationCode: immunizationCodeSchema,
    status: childImmunizationStatusSchema,
    givenAt: dateOnlyNotFutureSchema.nullable(),
    note: z.string().max(TRACKER_FIELD_LIMITS.noteMaxLength).nullable(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.childBirthDate !== undefined &&
      value.givenAt !== null &&
      value.givenAt < value.childBirthDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["givenAt"],
        message: TRACKER_VALIDATION_COPY.immunizationBeforeBirth,
      });
    }
  });

export type UpsertChildImmunizationInput = z.infer<
  typeof upsertChildImmunizationInputSchema
>;

export const upsertChildMilestoneInputSchema = z
  .object({
    childId: childIdSchema,
    childBirthDate: dateOnlySchema.optional(),
    milestoneId: z
      .string()
      .uuid("milestoneId harus UUID")
      .transform((v) => asMilestoneId(v)),
    status: childMilestoneStatusSchema,
    checkedAt: dateOnlyNotFutureSchema.nullable(),
    note: z.string().max(TRACKER_FIELD_LIMITS.noteMaxLength).nullable(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.childBirthDate !== undefined &&
      value.checkedAt !== null &&
      value.checkedAt < value.childBirthDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkedAt"],
        message: TRACKER_VALIDATION_COPY.milestoneBeforeBirth,
      });
    }
  });

export type UpsertChildMilestoneInput = z.infer<
  typeof upsertChildMilestoneInputSchema
>;

/* ─────────────────────────── DB row mappers ─────────────────────────── */

type ImmunizationRow = Tables<"immunization_schedule">;
type ChildImmunizationRow = Tables<"child_immunizations">;
type MilestoneRow = Tables<"milestones">;
type ChildMilestoneRow = Tables<"child_milestones">;

export function mapImmunizationRow(
  row: ImmunizationRow,
): Result<Immunization, ValidationError> {
  return ok(
    new Immunization({
      code: asImmunizationCode(row.code),
      name: row.name,
      doseNumber: row.dose_number,
      recommendedAgeMonths: row.recommended_age_months,
      notes: row.notes,
      prevents: row.prevents,
      displayOrder: row.display_order,
    }),
  );
}

export function mapChildImmunizationRow(
  row: ChildImmunizationRow,
): Result<ChildImmunization, ValidationError> {
  const statusResult = childImmunizationStatusSchema.safeParse(row.status);
  if (!statusResult.success) {
    return err(AppErrors.validation(`status tidak valid: ${row.status}`));
  }
  if (row.given_at !== null && !isDateOnly(row.given_at)) {
    return err(AppErrors.validation(`given_at tidak valid: ${row.given_at}`));
  }
  return ok(
    new ChildImmunization({
      id: asChildImmunizationId(row.id),
      userId: asUserId(row.user_id),
      childId: asChildId(row.child_id),
      immunizationCode: asImmunizationCode(row.immunization_code),
      status: statusResult.data as ChildImmunizationStatus,
      givenAt: row.given_at ? asDateOnly(row.given_at) : null,
      note: row.note,
    }),
  );
}

export function mapMilestoneRow(
  row: MilestoneRow,
): Result<Milestone, ValidationError> {
  const domainResult = milestoneDomainSchema.safeParse(row.domain);
  if (!domainResult.success) {
    return err(AppErrors.validation(`domain tidak valid: ${row.domain}`));
  }
  return ok(
    new Milestone({
      id: asMilestoneId(row.id),
      code: row.code,
      domain: domainResult.data as MilestoneDomain,
      minAgeMonths: row.min_age_months,
      maxAgeMonths: row.max_age_months,
      description: row.description,
      sourceLabel: row.source_label,
      displayOrder: row.display_order,
    }),
  );
}

export function mapChildMilestoneRow(
  row: ChildMilestoneRow,
): Result<ChildMilestone, ValidationError> {
  const statusResult = childMilestoneStatusSchema.safeParse(row.status);
  if (!statusResult.success) {
    return err(AppErrors.validation(`status tidak valid: ${row.status}`));
  }
  if (row.checked_at !== null && !isDateOnly(row.checked_at)) {
    return err(
      AppErrors.validation(`checked_at tidak valid: ${row.checked_at}`),
    );
  }
  return ok(
    new ChildMilestone({
      id: asChildMilestoneId(row.id),
      userId: asUserId(row.user_id),
      childId: asChildId(row.child_id),
      milestoneId: asMilestoneId(row.milestone_id),
      status: statusResult.data as ChildMilestoneStatus,
      checkedAt: row.checked_at ? asDateOnly(row.checked_at) : null,
      note: row.note,
    }),
  );
}

/* ─────────────────────────── nutrition events ─────────────────────────── */

type NutritionEventRow = Tables<"child_nutrition_events">;

export const nutritionEventKindSchema = z.enum(NUTRITION_EVENT_KINDS);

const nutritionEventDataSchema = z.record(z.string(), z.unknown());

export const recordNutritionEventInputSchema = z
  .object({
    childId: childIdSchema,
    kind: nutritionEventKindSchema,
    eventDate: dateOnlyNotFutureSchema,
    data: nutritionEventDataSchema.optional(),
    note: z.string().max(TRACKER_FIELD_LIMITS.noteMaxLength).nullable(),
  })
  .strict();

export type RecordNutritionEventInput = z.infer<
  typeof recordNutritionEventInputSchema
>;

export const deleteNutritionEventInputSchema = z
  .object({
    childId: childIdSchema,
    kind: nutritionEventKindSchema,
    eventDate: dateOnlyNotFutureSchema,
  })
  .strict();

export type DeleteNutritionEventInput = z.infer<
  typeof deleteNutritionEventInputSchema
>;

export function mapNutritionEventRow(
  row: NutritionEventRow,
): Result<NutritionEvent, ValidationError> {
  const kindResult = nutritionEventKindSchema.safeParse(row.kind);
  if (!kindResult.success) {
    return err(AppErrors.validation(`kind tidak valid: ${row.kind}`));
  }
  if (!isDateOnly(row.event_date)) {
    return err(
      AppErrors.validation(`event_date tidak valid: ${row.event_date}`),
    );
  }
  const data: NutritionEventData =
    typeof row.data === "object" &&
    row.data !== null &&
    !Array.isArray(row.data)
      ? (row.data as NutritionEventData)
      : {};
  return ok(
    new NutritionEvent({
      id: asNutritionEventId(row.id),
      userId: asUserId(row.user_id),
      childId: asChildId(row.child_id),
      kind: kindResult.data as NutritionEventKind,
      eventDate: asDateOnly(row.event_date),
      data,
      note: row.note,
    }),
  );
}
