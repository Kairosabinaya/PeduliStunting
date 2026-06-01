"use client";

// Client component: drives the cross-filter context from user input. Region
// selection happens by clicking the map; this bar holds the year picker and a
// clearable chip for the currently selected region.

import type { DashboardRegionRow } from "@/application/region/dashboard-dataset";
import {
  SegmentedControl,
  type SegmentedControlItem,
} from "@/components/primitives/segmented-control";
import { DASHBOARD_FILTERS } from "@/config/dashboard";
import { isSupportedYear, SUPPORTED_YEARS } from "@/config/years";

import { useDashboardFilter } from "./dashboard-filter-context";

export interface GlobalFilterBarProps {
  readonly regions: readonly DashboardRegionRow[];
}

export function GlobalFilterBar({ regions }: GlobalFilterBarProps) {
  const { year, selectedKodeBps, setYear, clearSelection } =
    useDashboardFilter();

  const selectedRegion =
    selectedKodeBps === null
      ? undefined
      : regions.find((row) => row.kodeBps === selectedKodeBps);

  const yearItems: readonly SegmentedControlItem<string>[] =
    SUPPORTED_YEARS.map((value) => ({
      id: String(value),
      label: String(value),
    }));

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {DASHBOARD_FILTERS.yearLabel}
        </span>
        <SegmentedControl
          ariaLabel={DASHBOARD_FILTERS.yearAriaLabel}
          value={String(year)}
          onValueChange={(id) => {
            const next = Number(id);
            if (isSupportedYear(next)) setYear(next);
          }}
          items={yearItems}
        />
      </div>
      {selectedRegion ? (
        <button
          type="button"
          onClick={() => clearSelection()}
          aria-label={DASHBOARD_FILTERS.clearRegionLabel}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 text-sm font-medium text-primary-ink transition-colors hover:bg-primary/15"
        >
          <span>{selectedRegion.kabupatenKota}</span>
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
