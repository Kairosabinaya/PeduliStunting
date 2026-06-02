import { TRACKER_MODAL } from "@/config/tracker";

/**
 * Resolve which child the `?modal=edit` query should open the edit modal for.
 *
 * The edit modal mutates a child profile, so it must target the *exact* child
 * named by `?anak=`. Unlike the read-only dashboard (which may fall back to the
 * first child for viewing), a stale, foreign, or deleted id must resolve to
 * `null` here — never to `children[0]` — otherwise saving the form would
 * silently overwrite the wrong child.
 *
 * @param children - The current account's children (already ownership-scoped).
 * @param anak - The `?anak=` selection, if any.
 * @param modal - The `?modal=` value, if any.
 * @returns The child to edit, or `null` when the edit modal must stay closed.
 *
 * @example
 * ```ts
 * const editChild = resolveEditTarget(children, anak, modal);
 * if (editChild) return <TrackerEditChildModal childId={editChild.id} />;
 * ```
 */
export function resolveEditTarget<T extends { readonly id: string }>(
  children: readonly T[],
  anak: string | undefined,
  modal: string | undefined,
): T | null {
  if (modal !== TRACKER_MODAL.editChild) return null;
  if (anak === undefined) return null;
  return children.find((child) => child.id === anak) ?? null;
}
