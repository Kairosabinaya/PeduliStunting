import type { RankRegionsCard as RankRegionsCardModel } from "@/application/ai/cards/ai-card";
import { cn } from "@/lib/cn";

import { categoryTone } from "./category-tone";

/**
 * Renders a region ranking list with rank, name, province, and prevalence.
 *
 * @example
 * ```tsx
 * <RankRegionsCard card={{ type: "rank-regions", tahun: 2024, order: "desc", rows: [] }} />
 * ```
 */
export function RankRegionsCard({
  card,
}: {
  readonly card: RankRegionsCardModel;
}) {
  const heading =
    card.order === "asc"
      ? `Prevalensi terendah ${card.tahun}`
      : `Prevalensi tertinggi ${card.tahun}`;
  return (
    <div className="rounded-lg border border-border bg-surface/70 p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        {heading}
      </p>
      <ol className="space-y-1.5">
        {card.rows.map((row) => (
          <li
            key={row.kodeBps}
            className="flex items-center gap-2 text-sm text-foreground"
          >
            <span className="w-5 shrink-0 text-right tabular-nums text-muted-foreground">
              {row.rank}.
            </span>
            <span className="min-w-0 flex-1 truncate">
              {row.kabupatenKota}
              <span className="ml-1 text-xs text-muted-foreground">
                {row.provinsi}
              </span>
            </span>
            <span
              className={cn(
                "shrink-0 font-semibold tabular-nums",
                categoryTone(row.category),
              )}
            >
              {row.prevalence !== null ? `${row.prevalence}%` : "-"}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
