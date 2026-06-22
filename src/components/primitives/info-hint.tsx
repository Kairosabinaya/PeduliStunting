"use client";

import { useId, useState, type ReactNode } from "react";
import { Info } from "lucide-react";

import { cn } from "@/lib/cn";

export interface InfoHintProps {
  /** Accessible name for the trigger; also labels the revealed panel. */
  readonly label: string;
  /** Helper content revealed on hover, focus, or tap. */
  readonly children: ReactNode;
  /** Horizontal edge the panel aligns to. Defaults to `start` (left). */
  readonly align?: "start" | "end";
  /** Extra classes for the revealed panel (e.g. a width override). */
  readonly className?: string;
}

/**
 * Compact "i" affordance that keeps explanatory copy out of the way until a
 * reader wants it. The panel appears on hover and keyboard focus, and tapping
 * the icon toggles it — so the hint is never hover-only.
 * The panel content stays mounted (visually hidden, not removed) so screen
 * readers reach it via `aria-describedby` and assistive queries still find it.
 *
 * @example
 * ```tsx
 * <InfoHint label="Cara membaca persamaan">
 *   Peluang tiap kelas adalah selisih peluang kumulatif.
 * </InfoHint>
 * ```
 */
export function InfoHint({
  label,
  children,
  align = "start",
  className,
}: InfoHintProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={panelId}
        onClick={() => setOpen((value) => !value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <Info size={14} aria-hidden />
      </button>
      <span
        role="tooltip"
        id={panelId}
        className={cn(
          "pointer-events-none absolute top-full z-tooltip mt-2 w-72 rounded-lg border border-border bg-surface p-3 text-left text-xs font-normal leading-relaxed text-muted-foreground opacity-0 shadow-md transition-opacity duration-150",
          open && "opacity-100",
          align === "end" ? "right-0" : "left-0",
          className,
        )}
      >
        {children}
      </span>
    </span>
  );
}
