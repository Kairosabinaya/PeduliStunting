"use server";

import { revalidateTag } from "next/cache";

import type { ChildDto } from "@/application/tracking/dtos";
import { makeUseCases } from "@/composition";
import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { asChildId, isUuid } from "@/domain/shared/ids";
import { err, type Result } from "@/domain/shared/result";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { childTag, childrenTag } from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import { DELETE_CHILD_COPY, EDIT_CHILD_COPY } from "@/config/tracker";
import { childFormInputSchema } from "@/schemas/tracking";

import type { AddChildFormState } from "./_lib/add-child-state";
import type { DeleteChildFormState } from "./_lib/delete-child-state";
import type { RestoreChildResult } from "./_lib/restore-child-state";

function toFormState(
  result: Result<ChildDto, AppError>,
  payload?: Record<string, string>,
): AddChildFormState {
  if (result.ok) {
    return { ok: true, child: result.value };
  }
  const fieldErrors =
    result.error.kind === "validation" ? result.error.fieldErrors : undefined;

  const state: AddChildFormState = fieldErrors
    ? { ok: false, message: result.error.message, fieldErrors }
    : { ok: false, message: result.error.message };

  return payload ? { ...state, payload } : state;
}

function validationFromFlatten(
  fieldErrors: Record<string, readonly string[] | undefined>,
  payload?: Record<string, string>,
): AddChildFormState {
  const cleaned: Record<string, readonly string[]> = {};
  for (const [key, value] of Object.entries(fieldErrors)) {
    if (value && value.length > 0) cleaned[key] = value;
  }
  return toFormState(
    err(AppErrors.validation("Periksa kembali isian Anda.", cleaned)),
    payload,
  );
}

/**
 * Create a new child profile owned by the current user. Revalidates the
 * children list tag and returns the created child in the success state. The
 * client form shows a "Data berhasil disimpan." toast and navigates to the new
 * child — deliberately NOT a server redirect, so the branded toast can fire
 * after the navigation (same pattern as `softDeleteChild`'s undo). Field-level
 * validation surfaces back via {@link AddChildFormState}.
 */
export async function createChild(
  _previous: AddChildFormState | null,
  formData: FormData,
): Promise<AddChildFormState> {
  const session = await requireServerSession();

  const isPremature = formData.get("birthStatus") === "preterm";

  const payload: Record<string, string> = {
    name: String(formData.get("name") ?? "").trim(),
    sex: String(formData.get("sex") ?? ""),
    birthDate: String(formData.get("birthDate") ?? ""),
    birthWeightKg: String(formData.get("birthWeightKg") ?? ""),
    birthLengthCm: String(formData.get("birthLengthCm") ?? ""),
    birthStatus: String(formData.get("birthStatus") ?? "term"),
    gestationalAgeWeeks: String(formData.get("gestationalAgeWeeks") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };

  const parsed = childFormInputSchema.safeParse({
    name: payload.name,
    sex: payload.sex,
    birthDate: payload.birthDate,
    birthWeightKg: payload.birthWeightKg,
    birthLengthCm: payload.birthLengthCm,
    birthStatus: isPremature ? "preterm" : "term",
    gestationalAgeWeeks: payload.gestationalAgeWeeks,
    notes: payload.notes,
  });

  if (!parsed.success) {
    return validationFromFlatten(parsed.error.flatten().fieldErrors, payload);
  }

  const supabase = await createSupabaseServerClient();
  const result = await makeUseCases(supabase).createChild.execute({
    userId: session.userId,
    name: parsed.data.name,
    sex: parsed.data.sex,
    birthDate: parsed.data.birthDate,
    birthWeightKg: parsed.data.birthWeightKg,
    birthLengthCm: parsed.data.birthLengthCm,
    gestationalAgeWeeks:
      parsed.data.birthStatus === "preterm"
        ? parsed.data.gestationalAgeWeeks
        : null,
    notes: parsed.data.notes,
  });

  if (!result.ok) {
    return toFormState(result, payload);
  }

  revalidateTag(childrenTag(session.userId), "max");
  return toFormState(result);
}

/**
 * Update an existing child profile owned by the current user. The child id
 * arrives via a hidden `childId` form field (so the action plugs into
 * `useActionState`); the remaining fields reuse {@link createChildInputSchema}.
 * On success the child's own tag and the children list tag are revalidated (the
 * name is shown in the switcher and list) and the updated child is returned in
 * the success state; the client form then shows a "Data berhasil disimpan."
 * toast and navigates to the child (no server redirect).
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

  const payload: Record<string, string> = {
    name: String(formData.get("name") ?? "").trim(),
    sex: String(formData.get("sex") ?? ""),
    birthDate: String(formData.get("birthDate") ?? ""),
    birthWeightKg: String(formData.get("birthWeightKg") ?? ""),
    birthLengthCm: String(formData.get("birthLengthCm") ?? ""),
    birthStatus: String(formData.get("birthStatus") ?? "term"),
    gestationalAgeWeeks: String(formData.get("gestationalAgeWeeks") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };

  const parsed = childFormInputSchema.safeParse({
    name: payload.name,
    sex: payload.sex,
    birthDate: payload.birthDate,
    birthWeightKg: payload.birthWeightKg,
    birthLengthCm: payload.birthLengthCm,
    birthStatus: isPremature ? "preterm" : "term",
    gestationalAgeWeeks: payload.gestationalAgeWeeks,
    notes: payload.notes,
  });

  if (!parsed.success) {
    return validationFromFlatten(parsed.error.flatten().fieldErrors, payload);
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
    gestationalAgeWeeks:
      parsed.data.birthStatus === "preterm"
        ? parsed.data.gestationalAgeWeeks
        : null,
    notes: parsed.data.notes,
  });

  if (!result.ok) {
    return toFormState(result, payload);
  }

  revalidateTag(childrenTag(session.userId), "max");
  revalidateTag(childTag(rawChildId), "max");
  return toFormState(result);
}

/**
 * Soft-delete a child profile owned by the current user. The child id arrives
 * via a hidden form field so the action plugs into `useActionState`. On success
 * the children list and the child's own cache tag are revalidated and the
 * action returns `{ ok: true }` — it deliberately does NOT redirect. The client
 * island shows an undo toast ("Pulihkan", Shneiderman rule 6) and navigates to
 * the tracker home itself, so the undo affordance is reachable after the
 * navigation. Failures surface back through {@link DeleteChildFormState}.
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
  return { ok: true };
}

/**
 * Restore a soft-deleted child — the undo path for {@link softDeleteChild},
 * invoked from the delete toast's "Pulihkan" action button. Revalidates the
 * children list and the child's own tag so the restored profile reappears.
 * Returns a tagged result the client maps to a confirmation or error toast.
 */
export async function restoreChild(
  childId: string,
): Promise<RestoreChildResult> {
  const rawChildId = childId.trim();
  if (!isUuid(rawChildId)) {
    return { ok: false, message: DELETE_CHILD_COPY.invalidId };
  }

  const session = await requireServerSession();
  const supabase = await createSupabaseServerClient();
  const result = await makeUseCases(supabase).restoreChild.execute(
    session.userId,
    asChildId(rawChildId),
  );

  if (!result.ok) {
    return { ok: false, message: result.error.message };
  }

  revalidateTag(childrenTag(session.userId), "max");
  revalidateTag(childTag(rawChildId), "max");
  return { ok: true };
}
