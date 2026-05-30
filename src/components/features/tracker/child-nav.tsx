"use client";

import { usePathname } from "next/navigation";

import {
  CHILD_DETAIL_COPY,
  trackerChildImmunizationsRoute,
  trackerChildMeasurementsRoute,
  trackerChildMilestonesRoute,
  trackerChildNutritionRoute,
  trackerChildRoute,
} from "@/config/tracker";
import { SegmentedNav } from "@/components/primitives/segmented-control";

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
 * route so server-side caching can be invalidated per resource. Built on the
 * shared {@link SegmentedNav} primitive so it matches every other segmented
 * switcher in the app.
 */
export function ChildNav({ childId }: ChildNavProps) {
  const pathname = usePathname();
  const items = buildItems(childId).map((item) => ({
    href: item.href,
    label: item.label,
    active: isActive(pathname, item),
  }));

  return <SegmentedNav ariaLabel="Navigasi detail anak" items={items} />;
}
