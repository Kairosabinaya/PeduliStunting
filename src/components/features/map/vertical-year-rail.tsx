"use client";

/**
 * Year picker rail. Reads/writes via {@link useMapState} so a click changes
 * React state instantly — no router, no RSC roundtrip.
 *
 * Layout: horizontal pill on mobile, vertical column on `lg+`. Parent owns
 * positioning.
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

export interface VerticalYearRailProps {
  readonly className?: string;
}

export function VerticalYearRail({ className }: VerticalYearRailProps) {
  const { tahun, setTahun } = useMapState();
  const years = useMemo(() => [...SUPPORTED_YEARS], []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const nextIdx = (index + delta + years.length) % years.length;
      const nextYear = years[nextIdx];
      if (nextYear !== undefined) setTahun(nextYear);
    },
    [setTahun, years],
  );

  return (
    <div
      role="radiogroup"
      aria-label={YEAR_RAIL_COPY.ariaLabel}
      className={cn(
        "glass-panel rounded-2xl p-2",
        className,
      )}
    >
      <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {YEAR_RAIL_COPY.title}
      </p>
      <ul className="flex flex-row gap-1 lg:flex-col">
        {years.map((year: SupportedYear, index) => {
          const active = year === tahun;
          return (
            <li key={year}>
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
                  "flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-xl px-3 font-mono text-sm tabular-nums transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                  active
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
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
