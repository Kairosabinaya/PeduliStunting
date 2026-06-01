import type {
  DashboardInsightsDto,
  RegionYearChangeEntry,
} from "@/application/region/insights";
import { Card } from "@/components/primitives/card";
import { DASHBOARD_MOVERS } from "@/config/dashboard";
import { CATEGORY_BG_CLASS } from "@/config/map";
import { cn } from "@/lib/cn";

import { categoryFromPrevalence } from "./category-utils";

export interface MoversLeaderboardProps {
  readonly movers?: DashboardInsightsDto["biggestMovers"];
}

function maxAbsChange(rows: readonly RegionYearChangeEntry[]): number {
  return rows.reduce((max, r) => Math.max(max, Math.abs(r.change)), 0);
}

function MoverList({
  title,
  rows,
  tone,
}: {
  readonly title: string;
  readonly rows: readonly RegionYearChangeEntry[];
  readonly tone: "good" | "bad";
}) {
  const max = maxAbsChange(rows) || 1;
  const deltaClass =
    tone === "good"
      ? "bg-ordinal-rendah/20 text-ordinal-rendah-foreground"
      : "bg-ordinal-tinggi/20 text-ordinal-tinggi";
  return (
    <Card padding="md" className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ol className="space-y-3">
        {rows.map((row, index) => {
          const sign = row.change > 0 ? "+" : "";
          return (
            <li key={row.kodeBps} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-baseline gap-2">
                  <span className="w-5 shrink-0 text-right font-mono text-xs text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-foreground">
                      {row.kabupatenKota}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {row.provinsi}
                    </span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {row.priorPrevalence.toFixed(1)} {DASHBOARD_MOVERS.arrow}{" "}
                    {row.focusPrevalence.toFixed(1)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      deltaClass,
                    )}
                  >
                    {sign}
                    {row.change.toFixed(1)}
                    {DASHBOARD_MOVERS.unitPoint}
                  </span>
                </span>
              </div>
              <span
                aria-hidden
                className="block h-1.5 w-full overflow-hidden rounded-full bg-surface-muted"
              >
                <span
                  className={cn(
                    "block h-full rounded-full",
                    CATEGORY_BG_CLASS[
                      categoryFromPrevalence(row.focusPrevalence)
                    ],
                  )}
                  style={{ width: `${(Math.abs(row.change) / max) * 100}%` }}
                />
              </span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

/**
 * Most-improved / most-worsened regions between the two latest years, shown as
 * a before→after leaderboard with a magnitude bar. Hand-rolled CSS, server
 * component. Renders nothing when the movers data is unavailable.
 */
export function MoversLeaderboard({ movers }: MoversLeaderboardProps) {
  if (!movers) return null;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <MoverList
        title={DASHBOARD_MOVERS.improvedTitle}
        rows={movers.improvements}
        tone="good"
      />
      <MoverList
        title={DASHBOARD_MOVERS.worsenedTitle}
        rows={movers.declines}
        tone="bad"
      />
    </div>
  );
}
