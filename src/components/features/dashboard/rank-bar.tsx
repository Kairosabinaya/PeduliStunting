import { cn } from "@/lib/cn";

/** Brand tone for the magnitude bar (no Google ordinal colour outside the map). */
export type RankBarTone = "good" | "bad";

export interface RankBarProps {
  /** Fill fraction (0..1) relative to the table's largest value. */
  readonly ratio: number;
  /** "good" (lowest list) reads sage accent, "bad" (highest list) reads primary blue. */
  readonly tone: RankBarTone;
}

const BAR_TONE: Record<RankBarTone, string> = {
  good: "bg-accent",
  bad: "bg-primary",
};

/**
 * Decorative inline magnitude bar for ranking rows. Hand-rolled CSS (zero
 * bundle, server component). Marked `aria-hidden` — the row's text carries the
 * meaning. Brand palette only.
 *
 * @example
 * ```tsx
 * <RankBar ratio={0.82} tone="bad" />
 * ```
 */
export function RankBar({ ratio, tone }: RankBarProps) {
  const pct = Math.max(0, Math.min(100, ratio * 100));
  return (
    <span
      aria-hidden
      className="block h-1.5 w-full overflow-hidden rounded-full bg-surface-muted"
    >
      <span
        className={cn("block h-full rounded-full", BAR_TONE[tone])}
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}
