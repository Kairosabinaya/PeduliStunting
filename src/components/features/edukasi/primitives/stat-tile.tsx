import { cn } from "@/lib/cn";

export interface StatTileProps {
  /** Large numeric/text value rendered prominently. */
  readonly value: React.ReactNode;
  /** Short caption below the value. */
  readonly caption: string;
  /** Optional helper line below the caption. */
  readonly helper?: string;
  /** Tone preset. Maps to background + border tokens. */
  readonly tone?: "primary" | "success" | "warm" | "neutral";
  readonly className?: string;
}

const TONE_CLASS: Record<NonNullable<StatTileProps["tone"]>, string> = {
  primary: "border-primary/30 bg-primary/8 text-foreground",
  success: "border-accent/40 bg-accent/12 text-foreground",
  warm: "border-edu-warm/40 bg-edu-warm/15 text-foreground",
  neutral: "border-border bg-surface text-foreground",
};

/**
 * Headline-sized stat card used by ACT 2 (brain development: 25/70/85)
 * and ACT 8 (posyandu services). Pure presentation — value can be a
 * string, number, or an `AnimatedCounter` element.
 */
export function StatTile({
  value,
  caption,
  helper,
  tone = "primary",
  className,
}: StatTileProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col gap-2 rounded-2xl border p-6 sm:p-7",
        TONE_CLASS[tone],
        className,
      )}
    >
      <div className="text-4xl font-bold leading-none tracking-tight text-primary sm:text-5xl">
        {value}
      </div>
      <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {caption}
      </p>
      {helper ? (
        <p className="mt-1 text-sm leading-relaxed text-foreground/80">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
