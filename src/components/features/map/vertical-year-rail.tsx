"use client";

/**
 * Year picker rail. Reads/writes via {@link useMapState} so a click changes
 * React state instantly — no router, no RSC roundtrip.
 *
 * Orientation is controlled by the parent (not by a breakpoint internally)
 * so the same rail can be rendered horizontally inside a mobile bottom-left
 * cluster and vertically inside a desktop bottom-left column. Keyboard
 * arrows respect the active orientation.
 */

import { useCallback, useMemo } from "react";

import { YEAR_RAIL_COPY } from "@/config/map";
import {
  SUPPORTED_YEARS,
  isSupportedYear,
  type SupportedYear,
} from "@/config/years";
import { cn } from "@/lib/cn";

import { useMapState } from "./map-state-context";

export type YearRailOrientation = "horizontal" | "vertical";

export interface VerticalYearRailProps {
  readonly orientation?: YearRailOrientation;
  readonly className?: string;
}

export function VerticalYearRail({
  orientation = "vertical",
  className,
}: VerticalYearRailProps) {
  const { tahun, setTahun } = useMapState();
  const years = useMemo(() => [...SUPPORTED_YEARS], []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
      const isVertical = orientation === "vertical";
      const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
      const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";
      if (event.key !== nextKey && event.key !== prevKey) return;
      event.preventDefault();
      const delta = event.key === nextKey ? 1 : -1;
      const nextIdx = (index + delta + years.length) % years.length;
      const nextYear = years[nextIdx];
      if (nextYear !== undefined) setTahun(nextYear);
    },
    [orientation, setTahun, years],
  );

  return (
    <div
      role="radiogroup"
      aria-label={YEAR_RAIL_COPY.ariaLabel}
      aria-orientation={orientation}
      className={cn("glass-panel rounded-2xl p-2", className)}
    >
      <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {YEAR_RAIL_COPY.title}
      </p>
      <ul
        className={cn(
          "flex gap-1",
          orientation === "vertical" ? "flex-col" : "flex-row",
        )}
      >
        {years.map((year: SupportedYear, index) => {
          const active = year === tahun;
          return (
            <li
              key={year}
              /* In horizontal mode each chip claims an equal share of
                 the row so the four years fill the container edge-to-
                 edge. Without this the chips collapse to their min-
                 content width and leave empty space on the right. */
              className={cn(orientation === "horizontal" && "flex-1")}
            >
              <div
                role="radio"
                tabIndex={active ? 0 : -1}
                aria-checked={active}
                onClick={() => {
                  if (isSupportedYear(year)) setTahun(year);
                }}
                onKeyDown={(event) => onKeyDown(event, index)}
                onKeyUp={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setTahun(year);
                  }
                }}
                className={cn(
                  "flex min-h-[44px] cursor-pointer items-center justify-center rounded-xl px-3 font-mono text-sm tabular-nums transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                  /* Square minimum is only meaningful in the vertical
                     column. Horizontal chips already stretch via the
                     parent `<li>`'s `flex-1`. */
                  orientation === "vertical" && "min-w-[44px]",
                  active
                    ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                    : "text-foreground/70 hover:bg-surface-muted/60 hover:text-foreground",
                )}
              >
                {year}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
