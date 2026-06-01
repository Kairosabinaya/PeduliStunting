"use client";

import type { ChildDto } from "@/application/tracking/dtos";
import { updateChild } from "@/app/(app)/tracker/actions";
import { EDIT_CHILD_COPY, trackerChildRoute } from "@/config/tracker";

import { ChildForm, type ChildFormDefaults } from "./child-form";

export interface EditChildFormProps {
  readonly child: ChildDto;
}

function numberToInput(value: number | null): string {
  return value !== null ? String(value) : "";
}

function toDefaults(child: ChildDto): ChildFormDefaults {
  return {
    name: child.name,
    sex: child.sex,
    birthDate: child.birthDate,
    birthWeightKg: numberToInput(child.birthWeightKg),
    birthLengthCm: numberToInput(child.birthLengthCm),
    // A recorded gestational age is the marker that the child was born preterm
    // (term babies never carry one — see the create flow).
    isPremature: child.gestationalAgeWeeks !== null,
    gestationalAgeWeeks: numberToInput(child.gestationalAgeWeeks),
    notes: child.notes ?? "",
  };
}

/**
 * Edit-child flow: the shared {@link ChildForm} pre-filled from the existing
 * {@link ChildDto} and bound to the `updateChild` Server Action. The child id
 * rides along as a hidden field. On success the action redirects back to the
 * child's detail page.
 *
 * @example
 * ```tsx
 * <EditChildForm child={child} />
 * ```
 */
export function EditChildForm({ child }: EditChildFormProps) {
  return (
    <ChildForm
      action={updateChild}
      submitLabel={EDIT_CHILD_COPY.submit}
      cancelHref={trackerChildRoute(child.id)}
      childId={child.id}
      defaults={toDefaults(child)}
    />
  );
}
