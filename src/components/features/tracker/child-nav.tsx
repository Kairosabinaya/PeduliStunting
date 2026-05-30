"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CHILD_DETAIL_COPY,
  trackerChildImmunizationsRoute,
  trackerChildMeasurementsRoute,
  trackerChildMilestonesRoute,
  trackerChildNutritionRoute,
  trackerChildRoute,
} from "@/config/tracker";
import { cn } from "@/lib/cn";

export interface ChildNavProps {
  readonly childId: string;
}

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly exact: boolean;
}

function buildItems(childId: string): readonly NavItem[] {
  return [
    {
      href: trackerChildRoute(childId),
      label: CHILD_DETAIL_COPY.navOverview,
      exact: true,
    },
    {
      href: trackerChildMeasurementsRoute(childId),
      label: CHILD_DETAIL_COPY.navMeasurements,
      exact: false,
    },
    {
      href: trackerChildImmunizationsRoute(childId),
      label: CHILD_DETAIL_COPY.navImmunizations,
      exact: false,
    },
    {
      href: trackerChildMilestonesRoute(childId),
      label: CHILD_DETAIL_COPY.navMilestones,
      exact: false,
    },
    {
      href: trackerChildNutritionRoute(childId),
      label: CHILD_DETAIL_COPY.navNutrition,
      exact: false,
    },
  ];
}

function isActive(pathname: string | null, item: NavItem): boolean {
  if (!pathname) return false;
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * Segmented sub-navigation rendered inside the child detail layout. Mirrors
 * the multi-route structure documented in STATE.md §5.2: each tab is its own
 * route so server-side caching can be invalidated per resource.
 */
export function ChildNav({ childId }: ChildNavProps) {
  const pathname = usePathname();
  const items = buildItems(childId);

  return (
    <nav
      aria-label="Navigasi detail anak"
      className="-mx-1 flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1"
    >
      {items.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-background",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
