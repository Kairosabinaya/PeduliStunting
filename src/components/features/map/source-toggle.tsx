"use client";

/**
 * Segmented control for the Map page data source (observed vs predicted).
 *
 * Client component because it pushes URL state. Renders as a `role="radiogroup"`
 * so it is reachable by screen reader and keyboard arrow keys. Hover-only
 * styling is avoided — focus and active states are explicit.
 */

import { useCallback, useId, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  MAP_SOURCES,
  MAP_SOURCE_OPTIONS,
  MAP_SOURCE_PARAM,
  type MapSource,
} from "@/config/map";
import { cn } from "@/lib/cn";

import { buildMapHref } from "./map-search-params";

export interface SourceToggleProps {
  readonly value: MapSource;
  readonly className?: string;
  /** Disable the predicted option when no model predictions are available. */
  readonly predictedAvailable?: boolean;
}

export function SourceToggle({
  value,
  className,
  predictedAvailable = true,
}: SourceToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const titleId = useId();

  const updateSource = useCallback(
    (next: MapSource) => {
      if (next === value) return;
      if (!(MAP_SOURCES as readonly string[]).includes(next)) return;
      const href = buildMapHref(new URLSearchParams(searchParams.toString()), {
        [MAP_SOURCE_PARAM]: next,
      });
      startTransition(() => {
        router.replace(`${pathname}${href}`, { scroll: false });
      });
    },
    [pathname, router, searchParams, value],
  );

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "rounded-xl border border-border bg-surface p-4",
        className,
      )}
      data-pending={pending ? "" : undefined}
    >
      <header className="flex flex-col gap-0.5">
        <h2 id={titleId} className="text-sm font-semibold text-foreground">
          Sumber data
        </h2>
      </header>
      <div
        role="radiogroup"
        aria-labelledby={titleId}
        className="mt-3 grid grid-cols-2 gap-2"
      >
        {MAP_SOURCE_OPTIONS.map((option) => {
          const selected = option.value === value;
          const disabled = option.value === "predicted" && !predictedAvailable;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-describedby={`${titleId}-${option.value}-hint`}
              disabled={disabled}
              onClick={() => updateSource(option.value)}
              className={cn(
                "flex h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-foreground hover:bg-surface-muted",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <dl className="mt-3 grid grid-cols-1 gap-1 text-xs text-muted-foreground sm:grid-cols-2">
        {MAP_SOURCE_OPTIONS.map((option) => (
          <div key={option.value} className="flex flex-col">
            <dt className="font-medium text-foreground">{option.label}</dt>
            <dd id={`${titleId}-${option.value}-hint`}>{option.hint}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
