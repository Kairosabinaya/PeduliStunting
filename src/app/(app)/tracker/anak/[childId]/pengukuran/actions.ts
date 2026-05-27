"use server";

import { revalidateTag } from "next/cache";

import type { GrowthMeasurementDto } from "@/application/tracking/dtos";
import { makeUseCases } from "@/composition";
import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { asChildId, isUuid } from "@/domain/shared/ids";
import { err, type Result } from "@/domain/shared/result";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { childTag, measurementsTag } from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import { recordMeasurementInputSchema } from "@/schemas/tracking";

import type { AddMeasurementFormState } from "./_lib/add-measurement-state";

function toFormState(
  result: Result<GrowthMeasurementDto, AppError>,
): AddMeasurementFormState {
  if (result.ok) {
    return { ok: true, measurement: result.value };
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
): AddMeasurementFormState {
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

function parseNullableNumber(raw: FormDataEntryValue | null): number | null {
  if (raw === null) return null;
  const value = String(raw).trim();
  if (value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function parseNullableString(raw: FormDataEntryValue | null): string | null {
  if (raw === null) return null;
  const value = String(raw).trim();
  return value === "" ? null : value;
}

function parseLyingFlag(raw: FormDataEntryValue | null): boolean | null {
  if (raw === null) return null;
  const value = String(raw);
  if (value === "lying") return true;
  if (value === "standing") return false;
  return null;
}

/**
 * Add a growth measurement for the given child. The use case computes the
 * four WHO z-scores and SD classifications server-side from the LMS table.
 * On success the per-child measurements and detail cache tags are revalidated
 * so the summary card, history, and chart all reflect the new row.
 */
export async function addMeasurement(
  childId: string,
  _previous: AddMeasurementFormState | null,
  formData: FormData,
): Promise<AddMeasurementFormState> {
  if (!isUuid(childId)) {
    return {
      ok: false,
      message: "ID anak tidak valid.",
    };
  }

  const session = await requireServerSession();

  const parsed = recordMeasurementInputSchema.safeParse({
    childId,
    measuredAt: formData.get("measuredAt"),
    weightKg: parseNullableNumber(formData.get("weightKg")),
    heightCm: parseNullableNumber(formData.get("heightCm")),
    measuredLying: parseLyingFlag(formData.get("measuredLying")),
    headCircumferenceCm: parseNullableNumber(
      formData.get("headCircumferenceCm"),
    ),
    muacCm: parseNullableNumber(formData.get("muacCm")),
    note: parseNullableString(formData.get("note")),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return validationFromFlatten(
      flat.fieldErrors,
      flat.formErrors[0],
    );
  }

  const supabase = await createSupabaseServerClient();
  const result = await makeUseCases(supabase).addMeasurement.execute({
    userId: session.userId,
    childId: asChildId(childId),
    measuredAt: parsed.data.measuredAt,
    weightKg: parsed.data.weightKg,
    heightCm: parsed.data.heightCm,
    measuredLying: parsed.data.measuredLying,
    headCircumferenceCm: parsed.data.headCircumferenceCm,
    muacCm: parsed.data.muacCm,
    note: parsed.data.note,
  });

  if (!result.ok) {
    return toFormState(result);
  }

  revalidateTag(measurementsTag(childId), "max");
  revalidateTag(childTag(childId), "max");
  return { ok: true, measurement: result.value };
}
