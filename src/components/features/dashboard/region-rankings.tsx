import type {
  DashboardInsightsDto,
  ProvinceRankEntry,
  RegionRankEntry,
} from "@/application/region/insights";
import { Badge } from "@/components/primitives/badge";
import { Card } from "@/components/primitives/card";
import { DASHBOARD_RANKINGS } from "@/config/dashboard";
import { CATEGORY_BADGE_TONE } from "@/config/map";

export interface RegionRankingsProps {
  readonly insights: DashboardInsightsDto;
}

function RegionTable({
  title,
  rows,
}: {
  readonly title: string;
  readonly rows: readonly RegionRankEntry[];
}) {
  return (
    <Card padding="md" className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ol className="space-y-2">
        {rows.map((row, index) => (
          <li
            key={row.kodeBps}
            className="flex items-center justify-between gap-3 text-sm"
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
            <span className="flex shrink-0 items-center gap-2">
              <span className="font-mono tabular-nums text-foreground">
                {row.prevalence.toFixed(1)}%
              </span>
              <Badge tone={CATEGORY_BADGE_TONE[row.category]}>
                {row.category}
              </Badge>
            </span>
          </li>
        ))}
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
      <ol className="space-y-2">
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
            <span className="font-mono tabular-nums text-foreground">
              {row.meanPrevalence.toFixed(1)}%
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

/**
 * Best/worst kabupaten/kota and province rankings for the focus year.
 */
export function RegionRankings({ insights }: RegionRankingsProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <RegionTable
          title={DASHBOARD_RANKINGS.bestRegionsTitle}
          rows={insights.bestRegions}
        />
        <RegionTable
          title={DASHBOARD_RANKINGS.worstRegionsTitle}
          rows={insights.worstRegions}
        />
      </div>
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
    </div>
  );
}
