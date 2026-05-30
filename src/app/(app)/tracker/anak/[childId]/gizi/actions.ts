"use server";

import { revalidateTag } from "next/cache";

import type { NutritionEventDto } from "@/application/health-plan/dtos";
import { makeUseCases } from "@/composition";
import {
  AppErrors,
  appErrorToHttpStatus,
  type AppError,
} from "@/domain/errors/app-error";
import { asChildId, isUuid } from "@/domain/shared/ids";
import { err, type Result } from "@/domain/shared/result";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { childTag, nutritionEventsTag } from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import {
  deleteNutritionEventInputSchema,
  recordNutritionEventInputSchema,
} from "@/schemas/health-plan";

import type { NutritionFormState } from "./_lib/nutrition-form-state";

function toFormState(
  result: Result<NutritionEventDto, AppError>,
): NutritionFormState {
  if (result.ok) {
    return { ok: true, record: result.value };
  }
  const fieldErrors =
    result.error.kind === "validation" ? result.error.fieldErrors : undefined;
  return fieldErrors
    ? { ok: false, message: result.error.message, fieldErrors }
    : { ok: false, message: result.error.message };
}

function validationFromFlatten(
  fieldErrors: Record<string, readonly string[] | undefined>,
  formError?: string,
): NutritionFormState {
  const cleaned: Record<string, readonly string[]> = {};
  for (const [key, value] of Object.entries(fieldErrors)) {
    if (value && value.length > 0) cleaned[key] = value;
  }
  return toFormState(
    err(
      AppErrors.validation(formError ?? "Periksa kembali isian Anda.", cleaned),
    ),
  );
}

function parseNullableString(raw: FormDataEntryValue | null): string | null {
  if (raw === null) return null;
  const value = String(raw).trim();
  return value === "" ? null : value;
}

function parseDataPayload(raw: FormDataEntryValue | null): unknown {
  if (raw === null) return {};
  try {
    return JSON.parse(String(raw));
  } catch {
    return {};
  }
}

/**
 * Server Action: mencatat satu peristiwa gizi (ASI / MPASI / Vit A / cacing).
 * Dipakai dari semua tab `/tracker/anak/[childId]/gizi`. Action di-bind per
 * tab dengan `childId` agar callsite tidak mengulang validasi ID.
 *
 * Payload bebas (`data`) dikirim sebagai JSON-encoded string lewat FormData
 * supaya React Server Actions tetap kompatibel — UI bertanggung jawab
 * meng-encode dictionary (mis. `{ exclusive: true }`) sebelum submit.
 */
export async function recordNutritionEvent(
  childId: string,
  _previous: NutritionFormState | null,
  formData: FormData,
): Promise<NutritionFormState> {
  if (!isUuid(childId)) {
    return { ok: false, message: "ID anak tidak valid." };
  }

  const session = await requireServerSession();

  const parsed = recordNutritionEventInputSchema.safeParse({
    childId,
    kind: formData.get("kind"),
    eventDate: formData.get("eventDate"),
    data: parseDataPayload(formData.get("data")),
    note: parseNullableString(formData.get("note")),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return validationFromFlatten(flat.fieldErrors, flat.formErrors[0]);
  }

  const supabase = await createSupabaseServerClient();
  const result = await makeUseCases(supabase).recordNutritionEvent.execute({
    userId: session.userId,
    childId: asChildId(childId),
    kind: parsed.data.kind,
    eventDate: parsed.data.eventDate,
    data: parsed.data.data ?? {},
    note: parsed.data.note,
  });

  if (!result.ok) {
    return toFormState(result);
  }

  revalidateTag(nutritionEventsTag(childId), "max");
  revalidateTag(childTag(childId), "max");
  return { ok: true, record: result.value };
}

/**
 * Server Action: hapus satu peristiwa gizi (mis. user salah catat tanggal
 * pemberian Vit A). Mengembalikan `NutritionFormState` tanpa record.
 */
export async function deleteNutritionEvent(
  childId: string,
  _previous: NutritionFormState | null,
  formData: FormData,
): Promise<NutritionFormState> {
  if (!isUuid(childId)) {
    return { ok: false, message: "ID anak tidak valid." };
  }

  const session = await requireServerSession();

  const parsed = deleteNutritionEventInputSchema.safeParse({
    childId,
    kind: formData.get("kind"),
    eventDate: formData.get("eventDate"),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return validationFromFlatten(flat.fieldErrors, flat.formErrors[0]);
  }

  const supabase = await createSupabaseServerClient();
  const result = await makeUseCases(supabase).deleteNutritionEvent.execute({
    userId: session.userId,
    childId: asChildId(childId),
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

  revalidateTag(nutritionEventsTag(childId), "max");
  revalidateTag(childTag(childId), "max");
  return { ok: true };
}

// Keep `appErrorToHttpStatus` reachable from type imports (kept for parity
// with the imunisasi route handler family).
export const _appErrorToHttpStatus = appErrorToHttpStatus;
