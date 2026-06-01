"use client";

import { createChild } from "@/app/(app)/tracker/actions";
import { ADD_CHILD_COPY, TRACKER_ROUTE } from "@/config/tracker";

import { ChildForm } from "./child-form";

/**
 * Create-child flow: the shared {@link ChildForm} bound to the `createChild`
 * Server Action with empty defaults. On success the action redirects to the new
 * child's detail page.
 *
 * @example
 * ```tsx
 * <AddChildForm />
 * ```
 */
export function AddChildForm() {
  return (
    <ChildForm
      action={createChild}
      submitLabel={ADD_CHILD_COPY.submit}
      cancelHref={TRACKER_ROUTE}
    />
  );
}
