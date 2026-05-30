import type { ComponentType } from "react";
import {
  LineChart,
  MapPinned,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import type { DashboardInsightsDto } from "@/application/region/insights";
import { FadeInView } from "@/components/features/edukasi/primitives/fade-in-view";
import { DASHBOARD_KPI } from "@/config/dashboard";
import { NATIONAL_CONTEXT } from "@/config/national-context";
import { cn } from "@/lib/cn";

export interface KpiCardsProps {
  readonly insights: DashboardInsightsDto;
}

type Tone = "primary" | "good" | "bad" | "tinggi" | "accent";

interface KpiTile {
  readonly label: string;
  readonly value: string;
  readonly hint: string;
  readonly icon: ComponentType<{ size?: number; className?: string }>;
  readonly tone: Tone;
}

const TONE: Record<Tone, { wrap: string; chip: string; value: string }> = {
  primary: {
    wrap: "border-primary/20 bg-primary/5",
    chip: "bg-primary/15 text-primary",
    value: "text-foreground",
  },
  accent: {
    wrap: "border-accent/30 bg-accent/10",
    chip: "bg-accent/20 text-accent-ink",
    value: "text-foreground",
  },
  good: {
    wrap: "border-ordinal-rendah/30 bg-ordinal-rendah/10",
    chip: "bg-ordinal-rendah/20 text-ordinal-rendah-foreground",
    value: "text-ordinal-rendah-foreground",
  },
  bad: {
    wrap: "border-ordinal-tinggi/30 bg-ordinal-tinggi/10",
    chip: "bg-ordinal-tinggi/20 text-ordinal-tinggi",
    value: "text-ordinal-tinggi",
  },
  tinggi: {
    wrap: "border-ordinal-tinggi/25 bg-ordinal-tinggi/5",
    chip: "bg-ordinal-tinggi/15 text-ordinal-tinggi",
    value: "text-foreground",
  },
};

function formatSigned(value: number, unit: string): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}${unit}`;
}

function buildTiles(insights: DashboardInsightsDto): readonly KpiTile[] {
  const focus = insights.perYear.find((p) => p.tahun === insights.focusYear);
  const focusIndex = insights.perYear.findIndex(
    (p) => p.tahun === insights.focusYear,
  );
  const prior = focusIndex > 0 ? insights.perYear[focusIndex - 1] : undefined;
  const mean = focus?.meanPrevalence ?? 0;
  const change = prior ? mean - prior.meanPrevalence : 0;
  const distance = mean - NATIONAL_CONTEXT.rpjmnTarget2029;
  // A falling prevalence is good news (green, down arrow); a rise is bad (red).
  const changeImproving = change <= 0;

  return [
    {
      label: `${DASHBOARD_KPI.meanLabel} (${insights.focusYear})`,
      value: `${mean.toFixed(1)}${DASHBOARD_KPI.unitPercent}`,
      hint: DASHBOARD_KPI.meanHint,
      icon: LineChart,
      tone: "primary",
    },
    {
      label: DASHBOARD_KPI.changeLabel,
      value: prior ? formatSigned(change, DASHBOARD_KPI.unitPoint) : "-",
      hint: prior ? `dibanding ${prior.tahun}` : DASHBOARD_KPI.meanHint,
      icon: changeImproving ? TrendingDown : TrendingUp,
      tone: prior ? (changeImproving ? "good" : "bad") : "primary",
    },
    {
      label: DASHBOARD_KPI.highCountLabel,
      value: `${focus?.tinggi ?? 0}`,
      hint: DASHBOARD_KPI.highCountHint,
      icon: MapPinned,
      tone: "tinggi",
    },
    {
      label: DASHBOARD_KPI.targetLabel,
      value: formatSigned(distance, DASHBOARD_KPI.unitPoint),
      hint: DASHBOARD_KPI.targetHint,
      icon: Target,
      tone: "accent",
    },
  ];
}

/**
 * Headline KPI tiles for the insight section: focus-year mean prevalence + YoY
 * change (green when falling, red when rising), count of high-category regions,
 * and the gap to the RPJMN target. Tinted, iconed, big display numerals, with a
 * staggered reveal.
 */
export function KpiCards({ insights }: KpiCardsProps) {
  const tiles = buildTiles(insights);
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile, index) => {
        const tone = TONE[tile.tone];
        const Icon = tile.icon;
        return (
          <li key={tile.label}>
            <FadeInView
              delayMs={index * 60}
              className={cn(
                "flex h-full flex-col gap-3 rounded-2xl border p-5 shadow-sm",
                tone.wrap,
              )}
            >
              <span
                className={cn(
                  "inline-flex size-10 items-center justify-center rounded-xl",
                  tone.chip,
                )}
              >
                <Icon size={20} aria-hidden />
              </span>
              <p
                className={cn(
                  "stat-number font-display text-4xl font-extrabold leading-none",
                  tone.value,
                )}
              >
                {tile.value}
              </p>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  {tile.label}
                </p>
                <p className="text-xs text-muted-foreground">{tile.hint}</p>
              </div>
            </FadeInView>
          </li>
        );
      })}
    </ul>
  );
}
