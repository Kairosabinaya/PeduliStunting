"use client";

/**
 * Floating, collapsible explainer for the three stunting categories. Lives in
 * the top-right corner of the map.
 *
 * Client component because users toggle expand/collapse locally and we don't
 * want that state to round-trip through the URL.
 */

import { useId, useState } from "react";

import {
  CATEGORY_BG_CLASS,
  CATEGORY_ORDER,
  STUNTING_INFO_COPY,
} from "@/config/map";
import { cn } from "@/lib/cn";

export interface StuntingInfoCardProps {
  readonly className?: string;
}

export function StuntingInfoCard({ className }: StuntingInfoCardProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const bodyId = useId();
  return (
    <aside
      aria-labelledby={titleId}
      className={cn(
        "glass-panel w-[min(22rem,100%)] rounded-2xl",
        className,
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 rounded-2xl p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <span className="flex-1">
          <span
            id={titleId}
            className="text-sm font-semibold text-foreground"
          >
            {open
              ? STUNTING_INFO_COPY.triggerOpen
              : STUNTING_INFO_COPY.triggerClosed}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {STUNTING_INFO_COPY.shortTagline}
          </span>
        </span>
        <span
          aria-hidden
          className={cn(
            "mt-0.5 inline-block h-5 w-5 shrink-0 rotate-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-full w-full">
            <path
              d="M5 7l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <div
        id={bodyId}
        hidden={!open}
        className="border-t border-border p-4 text-sm"
      >
        <ul className="space-y-3">
          {CATEGORY_ORDER.map((category) => {
            const copy = STUNTING_INFO_COPY.categories[category];
            return (
              <li key={category} className="flex gap-3">
                <span
                  aria-hidden
                  className={cn(
                    "mt-1 inline-block h-3 w-3 shrink-0 rounded-full",
                    CATEGORY_BG_CLASS[category],
                  )}
                />
                <span>
                  <span className="font-semibold text-foreground">
                    {copy.headline}
                  </span>{" "}
                  <span className="text-muted-foreground">{copy.tagline}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {copy.detail}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
          {STUNTING_INFO_COPY.footnote}
        </p>
      </div>
    </aside>
  );
}
