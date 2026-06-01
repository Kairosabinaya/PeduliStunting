import type {
  DashboardInsightsDto,
  ProvinceRankEntry,
  RegionRankEntry,
} from "@/application/region/insights";
import { Card } from "@/components/primitives/card";
import { DASHBOARD_RANKINGS } from "@/config/dashboard";
import { cn } from "@/lib/cn";

export type RankingScope = "region" | "province";

export interface RegionRankingsProps {
  readonly insights: DashboardInsightsDto;
  readonly scope: RankingScope;
  readonly highlightKodeBps?: string;
}

function RegionTable({
  title,
  rows,
  highlightKodeBps,
}: {
  readonly title: string;
  readonly rows: readonly RegionRankEntry[];
  readonly highlightKodeBps?: string;
}) {
  return (
    <Card padding="md" className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ol className="space-y-2.5">
        {rows.map((row, index) => {
          const highlighted = row.kodeBps === highlightKodeBps;
          return (
            <li
              key={row.kodeBps}
              {...(highlighted ? { "aria-current": true as const } : {})}
              className={cn(
                "flex items-center justify-between gap-3 text-sm",
                highlighted &&
                  "-mx-1.5 rounded-lg bg-primary/5 px-1.5 py-1 ring-2 ring-focus",
              )}
            >
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
              <span className="shrink-0 font-mono tabular-nums text-foreground">
                {row.prevalence.toFixed(1)}%
              </span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function ProvinceTable({
  title,
  rows,
}: {
  readonly title: string;
  readonly rows: readonly ProvinceRankEntry[];
}) {
  return (
    <Card padding="md" className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ol className="space-y-2.5">
        {rows.map((row, index) => (
          <li
            key={row.provinsi}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="w-5 shrink-0 text-right font-mono text-xs text-muted-foreground">
                {index + 1}
              </span>
              <span className="truncate text-foreground">{row.provinsi}</span>
            </span>
            <span className="shrink-0 font-mono tabular-nums text-foreground">
              {row.meanPrevalence.toFixed(1)}%
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function RegionRankings({
  insights,
  scope,
  highlightKodeBps,
}: RegionRankingsProps) {
  const highlight = highlightKodeBps;

  if (scope === "province") {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <ProvinceTable
          title={DASHBOARD_RANKINGS.bestProvincesTitle}
          rows={insights.bestProvinces}
        />
        <ProvinceTable
          title={DASHBOARD_RANKINGS.worstProvincesTitle}
          rows={insights.worstProvinces}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <RegionTable
        title={DASHBOARD_RANKINGS.bestRegionsTitle}
        rows={insights.bestRegions}
        {...(highlight ? { highlightKodeBps: highlight } : {})}
      />
      <RegionTable
        title={DASHBOARD_RANKINGS.worstRegionsTitle}
        rows={insights.worstRegions}
        {...(highlight ? { highlightKodeBps: highlight } : {})}
      />
    </div>
  );
}
