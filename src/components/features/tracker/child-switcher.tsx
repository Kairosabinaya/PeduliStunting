import Link from "next/link";

import type { ChildDto } from "@/application/tracking/dtos";
import { Avatar } from "@/components/primitives/avatar";
import { TRACKER_LIST_COPY, trackerSelectChildRoute } from "@/config/tracker";
import { cn } from "@/lib/cn";

export interface ChildSwitcherProps {
  /** All children on the account (caller only renders this when there are >1). */
  readonly childProfiles: readonly ChildDto[];
  /** Id of the currently selected child. */
  readonly selectedId: string;
}

/**
 * Avatar-chip switcher for the `/tracker` dashboard: each child is a circular
 * initials avatar plus name, the active one tinted with the brand colour. URL
 * driven via `?anak=` (each chip is a plain `<Link>`, so the whole thing stays
 * a Server Component with no client JS). The row scrolls horizontally on narrow
 * screens; every chip clears the 44px touch target.
 *
 * Adding a child lives in the page header CTA, so this switcher is selection
 * only — no "add" chip — to avoid two competing add affordances.
 *
 * @example
 * ```tsx
 * <ChildSwitcher childProfiles={children} selectedId={selected.id} />
 * ```
 */
export function ChildSwitcher({
  childProfiles,
  selectedId,
}: ChildSwitcherProps) {
  return (
    <nav aria-label={TRACKER_LIST_COPY.switcherAriaLabel} className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {TRACKER_LIST_COPY.switcherAriaLabel}
      </p>
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {childProfiles.map((child) => {
          const active = child.id === selectedId;
          return (
            <li key={child.id} className="shrink-0">
              <Link
                href={trackerSelectChildRoute(child.id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-full border py-1 pl-1 pr-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-foreground hover:bg-surface-muted",
                )}
              >
                <Avatar displayName={child.name} size="md" />
                <span className="max-w-40 truncate">{child.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
