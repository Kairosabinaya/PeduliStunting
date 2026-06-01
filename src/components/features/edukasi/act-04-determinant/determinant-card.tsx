// Single determinant layer card for the ACT 4 horizontal carousel. Pure
// presentation: a fill-less (transparent) card whose coloured outline carries a
// dark-green → light-green ramp across the carousel — leftmost card (L5) dark
// green, rightmost (L1) light green — plus the layer label, description, and the
// research-evidence callout. The card is `h-full`, so the flex row equalises
// every card to the TALLEST layer's natural content (no fixed-height box): the
// carousel never jumps, yet shorter layers no longer carry a tall blank gap.
// The evidence callout keeps a fixed `h-40` so the callouts stay uniform and
// bottom-aligned.

import { cn } from "@/lib/cn";
import { DETERMINANT_COPY } from "@/config/edukasi";
import type { DeterminantLayer } from "@/data/edukasi/determinants";

import { FootnoteRef } from "../primitives/footnote-ref";

// Per-layer outline colour. The `tone` field is authored in display order
// (L5 → L1), so it doubles as a stable position key: we map it to an all-green
// ramp ordered by light-mode luminance (sage-ink darkest → accent-soft
// lightest) so the borders read as a dark-green → light-green sweep left to
// right. All tokens are from the project green palette (no warm/red).
const BORDER_RAMP_CLASS: Record<DeterminantLayer["tone"], string> = {
  secondary: "border-accent-ink", // L5 — darkest green (leftmost)
  primary: "border-ordinal-rendah", // L4
  "primary-soft": "border-success", // L3
  success: "border-accent", // L2
  accent: "border-accent-soft", // L1 — lightest green (rightmost)
};

export interface DeterminantCardProps {
  readonly layer: DeterminantLayer;
  /** Spotlight styling when this card is the active carousel item. */
  readonly active?: boolean;
}

/**
 * Determinant layer card.
 *
 * @example
 * ```tsx
 * <DeterminantCard layer={DETERMINANT_LAYERS[0]} active />
 * ```
 */
export function DeterminantCard({
  layer,
  active = false,
}: DeterminantCardProps) {
  return (
    <article
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex h-full flex-col rounded-2xl border-2 bg-transparent p-6 shadow-sm transition-shadow sm:p-7",
        BORDER_RAMP_CLASS[layer.tone],
        active && "shadow-lg",
      )}
    >
      <h3 className="shrink-0 text-xl font-bold leading-tight text-foreground sm:text-2xl">
        {layer.label}
      </h3>
      {/* `flex-1` lets the description fill the slack so the evidence callout
          stays pinned to the bottom edge across every card. Cards equalise to
          the tallest layer's content (no fixed box), so this slack is small —
          just enough to align the callouts — instead of a tall blank gap. */}
      <div className="mt-4 flex-1">
        <p className="text-base leading-relaxed text-foreground/85">
          {layer.description}
        </p>
      </div>
      {/* Fixed height (`h-40`) so every card's evidence callout is identical;
          the body scrolls internally when a layer's evidence runs long. */}
      <aside className="mt-4 flex h-40 shrink-0 flex-col rounded-xl border border-border bg-surface p-4 shadow-xs">
        <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-primary">
          {DETERMINANT_COPY.evidenceLabel} · {layer.evidenceTitle}
        </p>
        <p className="mt-2 min-h-0 flex-1 overflow-y-auto text-sm leading-relaxed text-foreground/85">
          <span>{layer.evidenceBody}</span>
          {layer.evidenceFootnoteId ? (
            <FootnoteRef id={layer.evidenceFootnoteId} />
          ) : null}
        </p>
      </aside>
    </article>
  );
}
