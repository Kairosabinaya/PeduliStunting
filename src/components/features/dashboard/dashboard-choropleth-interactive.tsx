"use client";

// Client component: recolours per selected year and dispatches region clicks
// to the cross-filter context. Geometry (the year-independent path `d` data) is
// passed in from the server so no MapLibre/GeoJSON ships to the client.

import { useMemo } from "react";

import type { DashboardDatasetDto } from "@/application/region/dashboard-dataset";
import { DASHBOARD_CHOROPLETH } from "@/config/dashboard";
import { CATEGORY_FILL_CLASS } from "@/config/map";
import { cn } from "@/lib/cn";

import { useDashboardFilter } from "./dashboard-filter-context";

/** A single region's outline; `d` is year-independent so it ships once. */
export interface ChoroplethGeometryPath {
  readonly kodeBps: string;
  readonly kabupatenKota: string;
  readonly d: string;
}

export interface ChoroplethGeometry {
  readonly viewBox: { readonly width: number; readonly height: number };
  readonly paths: readonly ChoroplethGeometryPath[];
}

export interface DashboardChoroplethInteractiveProps {
  readonly geometry: ChoroplethGeometry;
  readonly dataset: DashboardDatasetDto;
  readonly className?: string;
}

export function DashboardChoroplethInteractive({
  geometry,
  dataset,
  className,
}: DashboardChoroplethInteractiveProps) {
  const { year, selectedKodeBps, setSelectedKodeBps } = useDashboardFilter();

  const byKode = useMemo(() => {
    const map = new Map<
      string,
      { category: "Rendah" | "Sedang" | "Tinggi"; prevalence: number | null }
    >();
    for (const region of dataset.regions) {
      const entry = region.byYear[year];
      if (entry !== undefined) map.set(region.kodeBps, entry);
    }
    return map;
  }, [dataset, year]);

  const counts = useMemo(() => {
    const tally = { Rendah: 0, Sedang: 0, Tinggi: 0, noData: 0 };
    for (const path of geometry.paths) {
      const entry = byKode.get(path.kodeBps);
      if (entry === undefined) tally.noData += 1;
      else tally[entry.category] += 1;
    }
    return tally;
  }, [byKode, geometry.paths]);

  return (
    <div className={cn("relative w-full", className)}>
      <svg
        viewBox={`0 0 ${geometry.viewBox.width} ${geometry.viewBox.height}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${DASHBOARD_CHOROPLETH.ariaLabel} (${year})`}
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          stroke="rgb(var(--color-background))"
          strokeWidth={0.4}
          strokeLinejoin="round"
        >
          {geometry.paths.map((path) => {
            const entry = byKode.get(path.kodeBps);
            const fill =
              entry === undefined
                ? "fill-muted-foreground/40"
                : CATEGORY_FILL_CLASS[entry.category];
            const selected = path.kodeBps === selectedKodeBps;
            const dimmed = selectedKodeBps !== null && !selected;
            const prevalenceText =
              entry && typeof entry.prevalence === "number"
                ? `${entry.prevalence.toLocaleString("id-ID")}%`
                : DASHBOARD_CHOROPLETH.noData;
            return (
              <path
                key={path.kodeBps}
                d={path.d}
                onClick={() =>
                  setSelectedKodeBps(selected ? null : path.kodeBps)
                }
                aria-label={`${path.kabupatenKota}: ${prevalenceText}`}
                className={cn(
                  "cursor-pointer transition-opacity duration-fast",
                  fill,
                  selected && "stroke-foreground",
                  dimmed && "opacity-40",
                )}
                {...(selected ? { strokeWidth: 1.4 } : {})}
              >
                <title>{`${path.kabupatenKota} — ${prevalenceText}`}</title>
              </path>
            );
          })}
        </g>
      </svg>
      <p className="sr-only">
        {`${DASHBOARD_CHOROPLETH.summaryPrefix} ${geometry.paths.length} ${DASHBOARD_CHOROPLETH.summaryRegions} (${year}): ${counts.Rendah} rendah, ${counts.Sedang} sedang, ${counts.Tinggi} tinggi` +
          (counts.noData > 0 ? `, ${counts.noData} tanpa data` : "") +
          "."}
      </p>
    </div>
  );
}
