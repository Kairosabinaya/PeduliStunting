"use server";

import { revalidateTag } from "next/cache";

import type { ChildImmunizationDto } from "@/application/health-plan/dtos";
import { makeUseCases } from "@/composition";
import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { asChildId, isUuid } from "@/domain/shared/ids";
import { err, type Result } from "@/domain/shared/result";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { childTag, immunizationsTag } from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import { upsertChildImmunizationInputSchema } from "@/schemas/health-plan";

import type { UpsertImmunizationFormState } from "./_lib/upsert-immunization-state";

function toFormState(
  result: Result<ChildImmunizationDto, AppError>,
): UpsertImmunizationFormState {
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
): UpsertImmunizationFormState {
  const cleaned: Record<string, readonly string[]> = {};
  for (const [key, value] of Object.entries(fieldErrors)) {
    if (value && value.length > 0) cleaned[key] = value;
  }
  return toFormState(
    err(
      AppErrors.validation(
        formError ?? "Periksa kembali isian Anda.",
        cleaned,
      ),
    ),
  );
}

function parseNullableString(raw: FormDataEntryValue | null): string | null {
  if (raw === null) return null;
  const value = String(raw).trim();
  return value === "" ? null : value;
}

/**
 * Upsert a single child's immunization record for the given catalog code.
 * Bound per-row from {@link ImmunizationChecklist} with childId and
 * immunizationCode so each list item gets its own action state. Cache tags
 * for the child detail snapshot and the immunization list are invalidated on
 * success so other routes (overview, list) reflect the change.
 */
export async function upsertChildImmunization(
  childId: string,
  immunizationCode: string,
  _previous: UpsertImmunizationFormState | null,
  formData: FormData,
): Promise<UpsertImmunizationFormState> {
  if (!isUuid(childId)) {
    return { ok: false, message: "ID anak tidak valid." };
  }

  const session = await requireServerSession();

  const parsed = upsertChildImmunizationInputSchema.safeParse({
    childId,
    immunizationCode,
    status: formData.get("status"),
    givenAt: parseNullableString(formData.get("givenAt")),
    note: parseNullableString(formData.get("note")),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return validationFromFlatten(flat.fieldErrors, flat.formErrors[0]);
  }

  const supabase = await createSupabaseServerClient();
  const result = await makeUseCases(supabase).upsertChildImmunization.execute({
    userId: session.userId,
    childId: asChildId(childId),
    immunizationCode: parsed.data.immunizationCode,
    status: parsed.data.status,
    givenAt: parsed.data.givenAt,
    note: parsed.data.note,
  });

  if (!result.ok) {
    return toFormState(result);
  }

  revalidateTag(immunizationsTag(childId), "max");
  revalidateTag(childTag(childId), "max");
  return { ok: true, record: result.value };
}
