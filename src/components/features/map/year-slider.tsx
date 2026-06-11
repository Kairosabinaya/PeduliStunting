"use client";

/**
 * Year selector for the Map page.
 *
 * Client component because it pushes URL state via {@link useRouter}. The
 * year list comes from `@/config/years` so a dataset import that extends the
 * range automatically extends the slider without code edits here.
 */

import { useCallback, useId, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { MAP_COPY, MAP_YEAR_PARAM } from "@/config/map";
import {
  SUPPORTED_YEARS,
  isSupportedYear,
  type SupportedYear,
} from "@/config/years";
import { cn } from "@/lib/cn";

import { buildMapHref } from "./map-search-params";

export interface YearSliderProps {
  readonly value: SupportedYear;
  readonly className?: string;
}

const MIN = SUPPORTED_YEARS[0];
const MAX = SUPPORTED_YEARS[SUPPORTED_YEARS.length - 1] ?? MIN;

export function YearSlider({ value, className }: YearSliderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const titleId = useId();

  const datalistId = useId();

  const updateYear = useCallback(
    (year: number) => {
      if (!isSupportedYear(year)) return;
      if (year === value) return;
      const next = buildMapHref(new URLSearchParams(searchParams.toString()), {
        [MAP_YEAR_PARAM]: String(year),
      });
      startTransition(() => {
        router.replace(`${pathname}${next}`, { scroll: false });
      });
    },
    [pathname, router, searchParams, value],
  );

  const ticks = useMemo(() => [...SUPPORTED_YEARS], []);

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "rounded-xl border border-border bg-surface p-4",
        className,
      )}
      data-pending={pending ? "" : undefined}
    >
      <header className="flex items-baseline justify-between gap-3">
        <h2 id={titleId} className="text-sm font-semibold text-foreground">
          {MAP_COPY.changeYearLabel}
        </h2>
        <output
          aria-live="polite"
          className="font-mono text-lg tabular-nums text-foreground"
        >
          {value}
        </output>
      </header>
      <input
        type="range"
        min={MIN}
        max={MAX}
        step={1}
        value={value}
        list={datalistId}
        aria-label={MAP_COPY.changeYearLabel}
        onChange={(event) => updateYear(Number(event.target.value))}
        className="mt-3 h-11 w-full cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
      <datalist id={datalistId}>
        {ticks.map((year) => (
          <option key={year} value={year} label={String(year)} />
        ))}
      </datalist>
      <ul className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        {ticks.map((year) => (
          <li key={year}>
            <button
              type="button"
              aria-pressed={year === value}
              onClick={() => updateYear(year)}
              className={cn(
                "rounded-md px-2 py-1 font-mono tabular-nums transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                year === value && "font-semibold text-foreground",
              )}
            >
              {year}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
