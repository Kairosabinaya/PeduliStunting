"use server";

import { revalidateTag } from "next/cache";

import type { ChildMilestoneDto } from "@/application/health-plan/dtos";
import { makeUseCases } from "@/composition";
import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { asChildId, isUuid } from "@/domain/shared/ids";
import { err, type Result } from "@/domain/shared/result";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { childTag, milestonesTag } from "@/lib/tracker-cache";
import { requireServerSession } from "@/lib/server-session";
import { upsertChildMilestoneInputSchema } from "@/schemas/health-plan";

import type { UpsertMilestoneFormState } from "./_lib/upsert-milestone-state";

function toFormState(
  result: Result<ChildMilestoneDto, AppError>,
): UpsertMilestoneFormState {
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
): UpsertMilestoneFormState {
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

/**
 * Upsert a single child's milestone status for the given catalog milestone.
 * Bound per-row from {@link MilestoneChecklist} with `childId` and
 * `milestoneId`. Cache tags for the child detail snapshot and the milestone
 * list are invalidated on success so other routes (overview, list) reflect
 * the change.
 */
export async function upsertChildMilestone(
  childId: string,
  milestoneId: string,
  _previous: UpsertMilestoneFormState | null,
  formData: FormData,
): Promise<UpsertMilestoneFormState> {
  if (!isUuid(childId)) {
    return { ok: false, message: "ID anak tidak valid." };
  }

  const session = await requireServerSession();

  const parsed = upsertChildMilestoneInputSchema.safeParse({
    childId,
    childBirthDate:
      parseNullableString(formData.get("childBirthDate")) ?? undefined,
    milestoneId,
    status: formData.get("status"),
    checkedAt: parseNullableString(formData.get("checkedAt")),
    note: parseNullableString(formData.get("note")),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return validationFromFlatten(flat.fieldErrors, flat.formErrors[0]);
  }

  const supabase = await createSupabaseServerClient();
  const result = await makeUseCases(supabase).upsertChildMilestone.execute({
    userId: session.userId,
    childId: asChildId(childId),
    milestoneId: parsed.data.milestoneId,
    status: parsed.data.status,
    checkedAt: parsed.data.checkedAt,
    note: parsed.data.note,
  });

  if (!result.ok) {
    return toFormState(result);
  }

  revalidateTag(milestonesTag(childId), "max");
  revalidateTag(childTag(childId), "max");
  return { ok: true, record: result.value };
}
