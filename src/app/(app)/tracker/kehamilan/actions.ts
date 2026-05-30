"use server";

import { revalidateTag } from "next/cache";

import { makeUseCases } from "@/composition";
import { AppErrors, type AppError } from "@/domain/errors/app-error";
import type {
  PregnancyDto,
  PregnancyEventDto,
} from "@/application/pregnancy/dtos";
import { asPregnancyId, isUuid } from "@/domain/shared/ids";
import { type Result } from "@/domain/shared/result";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { pregnancyEventsTag, pregnancyTag } from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import {
  createPregnancyInputSchema,
  deletePregnancyEventInputSchema,
  recordPregnancyEventInputSchema,
  updatePregnancyInputSchema,
} from "@/schemas/pregnancy";

import type {
  PregnancyEventFormState,
  PregnancyProfileFormState,
} from "./_lib/pregnancy-form-state";

function toProfileFormState(
  result: Result<PregnancyDto, AppError>,
): PregnancyProfileFormState {
  if (result.ok) return { ok: true, record: result.value };
  const fieldErrors =
    result.error.kind === "validation" ? result.error.fieldErrors : undefined;
  return fieldErrors
    ? { ok: false, message: result.error.message, fieldErrors }
    : { ok: false, message: result.error.message };
}

function toEventFormState(
  result: Result<PregnancyEventDto, AppError>,
): PregnancyEventFormState {
  if (result.ok) return { ok: true, record: result.value };
  const fieldErrors =
    result.error.kind === "validation" ? result.error.fieldErrors : undefined;
  return fieldErrors
    ? { ok: false, message: result.error.message, fieldErrors }
    : { ok: false, message: result.error.message };
}

function validationToState<
  S extends {
    ok: boolean;
    message?: string;
    fieldErrors?: Readonly<Record<string, readonly string[]>>;
  },
>(
  fieldErrors: Record<string, readonly string[] | undefined>,
  formError?: string,
): S {
  const cleaned: Record<string, readonly string[]> = {};
  for (const [key, value] of Object.entries(fieldErrors)) {
    if (value && value.length > 0) cleaned[key] = value;
  }
  const error = AppErrors.validation(
    formError ?? "Periksa kembali isian Anda.",
    cleaned,
  );
  return {
    ok: false,
    message: error.message,
    fieldErrors: error.fieldErrors,
  } as S;
}

function parseNullableString(raw: FormDataEntryValue | null): string | null {
  if (raw === null) return null;
  const value = String(raw).trim();
  return value === "" ? null : value;
}

function parseNullableNumber(raw: FormDataEntryValue | null): number | null {
  const value = parseNullableString(raw);
  if (value === null) return null;
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDataPayload(raw: FormDataEntryValue | null): unknown {
  if (raw === null) return {};
  try {
    return JSON.parse(String(raw));
  } catch {
    return {};
  }
}

export async function savePregnancyProfile(
  _previous: PregnancyProfileFormState | null,
  formData: FormData,
): Promise<PregnancyProfileFormState> {
  const session = await requireServerSession();
  const pregnancyId = parseNullableString(formData.get("pregnancyId"));

  const baseInput = {
    hpht: formData.get("hpht"),
    expectedDue: parseNullableString(formData.get("expectedDue")),
    initialWeightKg: parseNullableNumber(formData.get("initialWeightKg")),
    heightCm: parseNullableNumber(formData.get("heightCm")),
    notes: parseNullableString(formData.get("notes")),
  };

  if (pregnancyId === null) {
    const parsed = createPregnancyInputSchema.safeParse(baseInput);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      return validationToState<PregnancyProfileFormState>(
        flat.fieldErrors,
        flat.formErrors[0],
      );
    }
    const supabase = await createSupabaseServerClient();
    const result = await makeUseCases(supabase).upsertPregnancy.execute({
      userId: session.userId,
      pregnancyId: null,
      hpht: parsed.data.hpht,
      expectedDue: parsed.data.expectedDue,
      initialWeightKg: parsed.data.initialWeightKg,
      heightCm: parsed.data.heightCm,
      notes: parsed.data.notes,
    });
    if (result.ok) {
      revalidateTag(pregnancyTag(session.userId), "max");
    }
    return toProfileFormState(result);
  }

  if (!isUuid(pregnancyId)) {
    return { ok: false, message: "ID kehamilan tidak valid." };
  }

  const parsed = updatePregnancyInputSchema.safeParse({
    ...baseInput,
    pregnancyId,
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return validationToState<PregnancyProfileFormState>(
      flat.fieldErrors,
      flat.formErrors[0],
    );
  }
  const supabase = await createSupabaseServerClient();
  const result = await makeUseCases(supabase).upsertPregnancy.execute({
    userId: session.userId,
    pregnancyId: parsed.data.pregnancyId,
    hpht: parsed.data.hpht,
    expectedDue: parsed.data.expectedDue,
    initialWeightKg: parsed.data.initialWeightKg,
    heightCm: parsed.data.heightCm,
    notes: parsed.data.notes,
  });
  if (result.ok) {
    revalidateTag(pregnancyTag(session.userId), "max");
    revalidateTag(pregnancyEventsTag(pregnancyId), "max");
  }
  return toProfileFormState(result);
}

export async function archivePregnancy(
  pregnancyId: string,
): Promise<{ ok: boolean; message?: string }> {
  if (!isUuid(pregnancyId)) {
    return { ok: false, message: "ID kehamilan tidak valid." };
  }
  const session = await requireServerSession();
  const supabase = await createSupabaseServerClient();
  const result = await makeUseCases(supabase).archivePregnancy.execute(
    session.userId,
    asPregnancyId(pregnancyId),
  );
  if (!result.ok) {
    return { ok: false, message: result.error.message };
  }
  revalidateTag(pregnancyTag(session.userId), "max");
  return { ok: true };
}

export async function recordPregnancyEvent(
  pregnancyId: string,
  _previous: PregnancyEventFormState | null,
  formData: FormData,
): Promise<PregnancyEventFormState> {
  if (!isUuid(pregnancyId)) {
    return { ok: false, message: "ID kehamilan tidak valid." };
  }
  const session = await requireServerSession();

  const parsed = recordPregnancyEventInputSchema.safeParse({
    pregnancyId,
    kind: formData.get("kind"),
    eventDate: formData.get("eventDate"),
    data: parseDataPayload(formData.get("data")),
    note: parseNullableString(formData.get("note")),
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return validationToState<PregnancyEventFormState>(
      flat.fieldErrors,
      flat.formErrors[0],
    );
  }

  const supabase = await createSupabaseServerClient();
  const result = await makeUseCases(supabase).recordPregnancyEvent.execute({
    userId: session.userId,
    pregnancyId: parsed.data.pregnancyId,
    kind: parsed.data.kind,
    eventDate: parsed.data.eventDate,
    data: parsed.data.data ?? {},
    note: parsed.data.note,
  });

  if (result.ok) {
    revalidateTag(pregnancyEventsTag(pregnancyId), "max");
    // Recording an event (ANC visit, TTD dose, weight) can change the derived
    // pregnancy overview/status, which is cached under the user-scoped tag.
    revalidateTag(pregnancyTag(session.userId), "max");
  }
  return toEventFormState(result);
}

export async function deletePregnancyEvent(
  pregnancyId: string,
  _previous: PregnancyEventFormState | null,
  formData: FormData,
): Promise<PregnancyEventFormState> {
  if (!isUuid(pregnancyId)) {
    return { ok: false, message: "ID kehamilan tidak valid." };
  }
  const session = await requireServerSession();

  const parsed = deletePregnancyEventInputSchema.safeParse({
    pregnancyId,
    kind: formData.get("kind"),
    eventDate: formData.get("eventDate"),
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return validationToState<PregnancyEventFormState>(
      flat.fieldErrors,
      flat.formErrors[0],
    );
  }

  const supabase = await createSupabaseServerClient();
  const result = await makeUseCases(supabase).deletePregnancyEvent.execute({
    userId: session.userId,
    pregnancyId: parsed.data.pregnancyId,
    kind: parsed.data.kind,
    eventDate: parsed.data.eventDate,
  });

  if (!result.ok) {
    const fieldErrors =
      result.error.kind === "validation" ? result.error.fieldErrors : undefined;
    return fieldErrors
      ? { ok: false, message: result.error.message, fieldErrors }
      : { ok: false, message: result.error.message };
  }

  revalidateTag(pregnancyEventsTag(pregnancyId), "max");
  revalidateTag(pregnancyTag(session.userId), "max");
  return { ok: true };
}
