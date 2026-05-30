import { z } from "zod";

import type { Tables } from "@/types/supabase";
import { AppErrors, type ValidationError } from "@/domain/errors/app-error";
import { type Result, err, ok } from "@/domain/shared/result";
import {
  asPregnancyEventId,
  asPregnancyId,
  asUserId,
} from "@/domain/shared/ids";
import { asDateOnly, isDateOnly } from "@/domain/shared/date-only";
import { Pregnancy } from "@/domain/pregnancy/entities/pregnancy";
import {
  PREGNANCY_EVENT_KINDS,
  PregnancyEvent,
  type PregnancyEventData,
  type PregnancyEventKind,
} from "@/domain/pregnancy/entities/pregnancy-event";
import { dateOnlySchema } from "./tracking";

/* ─────────────────────────── input parsing ─────────────────────────── */

export const pregnancyIdSchema = z
  .string()
  .uuid("pregnancyId harus UUID")
  .transform((v) => asPregnancyId(v));

export const pregnancyEventKindSchema = z.enum(PREGNANCY_EVENT_KINDS);

const pregnancyEventDataSchema = z.record(z.string(), z.unknown());

export const createPregnancyInputSchema = z
  .object({
    hpht: dateOnlySchema,
    expectedDue: dateOnlySchema.nullable(),
    initialWeightKg: z.number().positive().max(200).nullable(),
    heightCm: z.number().positive().max(220).nullable(),
    notes: z.string().max(1000).nullable(),
  })
  .strict();

export type CreatePregnancyInputDto = z.infer<
  typeof createPregnancyInputSchema
>;

export const updatePregnancyInputSchema = createPregnancyInputSchema.extend({
  pregnancyId: pregnancyIdSchema,
});

export type UpdatePregnancyInputDto = z.infer<
  typeof updatePregnancyInputSchema
>;

export const recordPregnancyEventInputSchema = z
  .object({
    pregnancyId: pregnancyIdSchema,
    kind: pregnancyEventKindSchema,
    eventDate: dateOnlySchema,
    data: pregnancyEventDataSchema.optional(),
    note: z.string().max(500).nullable(),
  })
  .strict();

export type RecordPregnancyEventInput = z.infer<
  typeof recordPregnancyEventInputSchema
>;

export const deletePregnancyEventInputSchema = z
  .object({
    pregnancyId: pregnancyIdSchema,
    kind: pregnancyEventKindSchema,
    eventDate: dateOnlySchema,
  })
  .strict();

export type DeletePregnancyEventInput = z.infer<
  typeof deletePregnancyEventInputSchema
>;

/* ─────────────────────────── DB row mappers ─────────────────────────── */

type PregnancyRow = Tables<"pregnancies">;
type PregnancyEventRow = Tables<"pregnancy_events">;

export function mapPregnancyRow(
  row: PregnancyRow,
): Result<Pregnancy, ValidationError> {
  if (!isDateOnly(row.hpht)) {
    return err(AppErrors.validation(`hpht tidak valid: ${row.hpht}`));
  }
  if (row.expected_due !== null && !isDateOnly(row.expected_due)) {
    return err(
      AppErrors.validation(`expected_due tidak valid: ${row.expected_due}`),
    );
  }
  return ok(
    new Pregnancy({
      id: asPregnancyId(row.id),
      userId: asUserId(row.user_id),
      hpht: asDateOnly(row.hpht),
      expectedDue: row.expected_due ? asDateOnly(row.expected_due) : null,
      initialWeightKg: row.initial_weight_kg,
      heightCm: row.height_cm,
      notes: row.notes,
      archivedAt: row.archived_at,
    }),
  );
}

export function mapPregnancyEventRow(
  row: PregnancyEventRow,
): Result<PregnancyEvent, ValidationError> {
  const kindResult = pregnancyEventKindSchema.safeParse(row.kind);
  if (!kindResult.success) {
    return err(AppErrors.validation(`kind tidak valid: ${row.kind}`));
  }
  if (!isDateOnly(row.event_date)) {
    return err(
      AppErrors.validation(`event_date tidak valid: ${row.event_date}`),
    );
  }
  const data: PregnancyEventData =
    typeof row.data === "object" &&
    row.data !== null &&
    !Array.isArray(row.data)
      ? (row.data as PregnancyEventData)
      : {};
  return ok(
    new PregnancyEvent({
      id: asPregnancyEventId(row.id),
      userId: asUserId(row.user_id),
      pregnancyId: asPregnancyId(row.pregnancy_id),
      kind: kindResult.data as PregnancyEventKind,
      eventDate: asDateOnly(row.event_date),
      data,
      note: row.note,
    }),
  );
}
