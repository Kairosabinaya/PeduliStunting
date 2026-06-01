import { Card } from "@/components/primitives/card";
import { cn } from "@/lib/cn";

/** Drives the colour of the headline number only — never the card background. */
export type StatTone = "neutral" | "good" | "bad";

export interface StatCardProps {
  readonly label: string;
  /** Pre-formatted number including unit/sign (e.g. "22.6%", "-0.8 poin"). */
  readonly value: string;
  readonly hint?: string;
  readonly tone?: StatTone;
}

// All headline numbers render in primary blue for visual consistency.
// Tone is kept on the type so callers stay unchanged; all tones map to primary.
const NUMBER_TONE: Record<StatTone, string> = {
  neutral: "text-primary",
  good: "text-primary",
  bad: "text-primary",
};

/**
 * Flat KPI tile in the geopangan style: a refined headline number (bold, not
 * extra-bold) carries the semantic colour, with a muted hint below. No pill, no
 * progress bar, no icon.
 *
 * @example Neutral metric
 * ```tsx
 * <StatCard label="Rata-rata stunting (2024)" value="22.6%" hint="Rata-rata seluruh kabupaten/kota." />
 * ```
 *
 * @example Coloured share
 * ```tsx
 * <StatCard label="Wilayah stunting rendah" value="40%" tone="good" />
 * ```
 */
export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
}: StatCardProps) {
  return (
    <Card
      elevation="sm"
      padding="md"
      className="flex h-full flex-col gap-1.5 rounded-2xl"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "stat-number text-4xl font-bold tracking-tight",
          NUMBER_TONE[tone],
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="text-xs leading-snug text-muted-foreground">{hint}</p>
      ) : null}
    </Card>
  );
}
