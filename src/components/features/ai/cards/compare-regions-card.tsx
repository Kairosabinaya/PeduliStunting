import type { CompareRegionsCard as CompareRegionsCardModel } from "@/application/ai/cards/ai-card";
import { cn } from "@/lib/cn";

import { categoryTone } from "./category-tone";

/**
 * Renders a region comparison as labelled prevalence bars.
 *
 * @example
 * ```tsx
 * <CompareRegionsCard card={{ type: "compare-regions", tahun: 2024, rows: [] }} />
 * ```
 */
export function CompareRegionsCard({
  card,
}: {
  readonly card: CompareRegionsCardModel;
}) {
  const max = Math.max(...card.rows.map((row) => row.prevalence ?? 0), 1);
  return (
    <div className="rounded-lg border border-border bg-surface/70 p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Perbandingan prevalensi {card.tahun}
      </p>
      <ul className="space-y-2">
        {card.rows.map((row) => (
          <li key={row.kodeBps} className="text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-foreground">
                {row.kabupatenKota}
              </span>
              <span
                className={cn(
                  "shrink-0 font-semibold tabular-nums",
                  categoryTone(row.category),
                )}
              >
                {row.prevalence !== null ? `${row.prevalence}%` : "-"}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${((row.prevalence ?? 0) / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
