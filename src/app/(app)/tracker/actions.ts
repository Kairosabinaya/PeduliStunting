"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import type { ChildDto } from "@/application/tracking/dtos";
import { makeUseCases } from "@/composition";
import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { asChildId, isUuid } from "@/domain/shared/ids";
import { err, type Result } from "@/domain/shared/result";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { childTag, childrenTag } from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import {
  DELETE_CHILD_COPY,
  EDIT_CHILD_COPY,
  TRACKER_ROUTE,
  trackerChildRoute,
} from "@/config/tracker";
import { createChildInputSchema } from "@/schemas/tracking";

import type { AddChildFormState } from "./_lib/add-child-state";
import type { DeleteChildFormState } from "./_lib/delete-child-state";

function toFormState(result: Result<ChildDto, AppError>): AddChildFormState {
  if (result.ok) {
    return { ok: true, child: result.value };
  }
  const fieldErrors =
    result.error.kind === "validation" ? result.error.fieldErrors : undefined;
  return fieldErrors
    ? { ok: false, message: result.error.message, fieldErrors }
    : { ok: false, message: result.error.message };
}

function validationFromFlatten(
  fieldErrors: Record<string, readonly string[] | undefined>,
): AddChildFormState {
  const cleaned: Record<string, readonly string[]> = {};
  for (const [key, value] of Object.entries(fieldErrors)) {
    if (value && value.length > 0) cleaned[key] = value;
  }
  return toFormState(
    err(AppErrors.validation("Periksa kembali isian Anda.", cleaned)),
  );
}

function parseNullableNumber(raw: FormDataEntryValue | null): number | null {
  if (raw === null) return null;
  const value = String(raw).trim();
  if (value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function parseNullableInt(raw: FormDataEntryValue | null): number | null {
  if (raw === null) return null;
  const value = String(raw).trim();
  if (value === "") return null;
  const num = Number.parseInt(value, 10);
  return Number.isFinite(num) ? num : null;
}

function parseNullableString(raw: FormDataEntryValue | null): string | null {
  if (raw === null) return null;
  const value = String(raw).trim();
  return value === "" ? null : value;
}

/**
 * Create a new child profile owned by the current user. Revalidates the
 * children list tag, then redirects to the freshly created child's detail
 * page. Field-level validation surfaces back to the form via the discriminated
 * {@link AddChildFormState}. See project guidelines §14.
 */
export async function createChild(
  _previous: AddChildFormState | null,
  formData: FormData,
): Promise<AddChildFormState> {
  const session = await requireServerSession();

  const isPremature = formData.get("birthStatus") === "preterm";

  const parsed = createChildInputSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    sex: formData.get("sex"),
    birthDate: formData.get("birthDate"),
    birthWeightKg: parseNullableNumber(formData.get("birthWeightKg")),
    birthLengthCm: parseNullableNumber(formData.get("birthLengthCm")),
    isPremature,
    gestationalAgeWeeks: parseNullableInt(formData.get("gestationalAgeWeeks")),
    notes: parseNullableString(formData.get("notes")),
  });

  if (!parsed.success) {
    return validationFromFlatten(parsed.error.flatten().fieldErrors);
  }

  const supabase = await createSupabaseServerClient();
  const result = await makeUseCases(supabase).createChild.execute({
    userId: session.userId,
    name: parsed.data.name,
    sex: parsed.data.sex,
    birthDate: parsed.data.birthDate,
    birthWeightKg: parsed.data.birthWeightKg,
    birthLengthCm: parsed.data.birthLengthCm,
    gestationalAgeWeeks: parsed.data.isPremature
      ? parsed.data.gestationalAgeWeeks
      : null,
    notes: parsed.data.notes,
  });

  if (!result.ok) {
    return toFormState(result);
  }

  revalidateTag(childrenTag(session.userId), "max");
  redirect(trackerChildRoute(result.value.id));
}

/**
 * Update an existing child profile owned by the current user. The child id
 * arrives via a hidden `childId` form field (so the action plugs into
 * `useActionState`); the remaining fields reuse {@link createChildInputSchema}.
 * On success the child's own tag and the children list tag are revalidated (the
 * name is shown in the switcher and list), then the user is redirected to the
 * child's detail page. See project guidelines §14.
 */
export async function updateChild(
  _previous: AddChildFormState | null,
  formData: FormData,
): Promise<AddChildFormState> {
  const rawChildId = String(formData.get("childId") ?? "").trim();
  if (!isUuid(rawChildId)) {
    return { ok: false, message: EDIT_CHILD_COPY.invalidId };
  }

  const session = await requireServerSession();

  const isPremature = formData.get("birthStatus") === "preterm";

  const parsed = createChildInputSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    sex: formData.get("sex"),
    birthDate: formData.get("birthDate"),
    birthWeightKg: parseNullableNumber(formData.get("birthWeightKg")),
    birthLengthCm: parseNullableNumber(formData.get("birthLengthCm")),
    isPremature,
    gestationalAgeWeeks: parseNullableInt(formData.get("gestationalAgeWeeks")),
    notes: parseNullableString(formData.get("notes")),
  });

  if (!parsed.success) {
    return validationFromFlatten(parsed.error.flatten().fieldErrors);
  }

  const supabase = await createSupabaseServerClient();
  const result = await makeUseCases(supabase).updateChild.execute({
    userId: session.userId,
    childId: asChildId(rawChildId),
    name: parsed.data.name,
    sex: parsed.data.sex,
    birthDate: parsed.data.birthDate,
    birthWeightKg: parsed.data.birthWeightKg,
    birthLengthCm: parsed.data.birthLengthCm,
    gestationalAgeWeeks: parsed.data.isPremature
      ? parsed.data.gestationalAgeWeeks
      : null,
    notes: parsed.data.notes,
  });

  if (!result.ok) {
    return toFormState(result);
  }

  revalidateTag(childrenTag(session.userId), "max");
  revalidateTag(childTag(rawChildId), "max");
  redirect(trackerChildRoute(rawChildId));
}

/**
 * Soft-delete a child profile owned by the current user. The child id arrives
 * via a hidden form field so the action plugs into `useActionState`. On success
 * the children list and the child's own cache tag are revalidated, then the
 * user is redirected to the tracker home — which re-selects the first remaining
 * child or shows the empty dashboard. Failures surface back through the
 * discriminated {@link DeleteChildFormState}. See project guidelines §14.
 */
export async function softDeleteChild(
  _previous: DeleteChildFormState | null,
  formData: FormData,
): Promise<DeleteChildFormState> {
  const rawChildId = String(formData.get("childId") ?? "").trim();
  if (!isUuid(rawChildId)) {
    return { ok: false, message: DELETE_CHILD_COPY.invalidId };
  }

  const session = await requireServerSession();
  const supabase = await createSupabaseServerClient();
  const result = await makeUseCases(supabase).softDeleteChild.execute(
    session.userId,
    asChildId(rawChildId),
  );

  if (!result.ok) {
    return { ok: false, message: result.error.message };
  }

  revalidateTag(childrenTag(session.userId), "max");
  revalidateTag(childTag(rawChildId), "max");
  redirect(TRACKER_ROUTE);
}
