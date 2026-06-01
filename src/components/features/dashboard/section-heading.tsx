import type { ReactNode } from "react";

export interface SectionHeadingProps {
  readonly title: string;
  readonly description?: string;
  /** Right-aligned slot, e.g. a trend Badge or a toggle. */
  readonly trailing?: ReactNode;
  /** Heading level — keep `h3` (default) inside cards to preserve hierarchy. */
  readonly as?: "h2" | "h3";
}

/**
 * Tidy section header: title (+ optional description) on the left, an optional
 * trailing slot on the right. Typography mirrors {@link CardTitle} /
 * {@link CardDescription} so it drops into existing cards without visual drift.
 * Use only when a trailing slot is needed; otherwise keep the plain
 * `CardHeader`/`CardTitle`/`CardDescription` composition.
 *
 * @example
 * ```tsx
 * <SectionHeading
 *   title="Tren stunting 2021-2024"
 *   description="Rata-rata wilayah vs angka nasional."
 *   trailing={<Badge tone="success">Menurun sejak 2021</Badge>}
 * />
 * ```
 */
export function SectionHeading({
  title,
  description,
  trailing,
  as = "h3",
}: SectionHeadingProps) {
  const Heading = as;
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1.5">
        <Heading className="text-lg font-semibold leading-tight text-foreground">
          {title}
        </Heading>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}
