"use client";

import { TrendingDown, TrendingUp, Minus, HelpCircle } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/primitives/badge";
import { TREND_COPY } from "@/config/tracker";
import { cn } from "@/lib/cn";
import type {
  GrowthTrend,
  GrowthTrendResult,
} from "@/domain/tracking/services/growth-trend";

export interface GrowthTrendChipProps {
  readonly result: GrowthTrendResult;
}

const TONE_FALLBACK: BadgeProps["tone"] = "neutral";

const ICON_MAP = {
  improving: TrendingUp,
  stable: Minus,
  monitor: TrendingDown,
  not_enough: HelpCircle,
} as const satisfies Record<GrowthTrend, typeof TrendingUp>;

const COPY_KEY_BY_TREND = {
  improving: "improving",
  stable: "stable",
  monitor: "monitor",
  not_enough: "notEnough",
} as const satisfies Record<GrowthTrend, keyof typeof TREND_COPY>;

/**
 * Ringkasan tren z-score di atas kurva. Menampilkan label + delta numerik
 * sehingga orang tua tahu arah perubahan tanpa membaca grafik.
 */
export function GrowthTrendChip({ result }: GrowthTrendChipProps) {
  const copy = TREND_COPY[COPY_KEY_BY_TREND[result.trend]];
  const Icon = ICON_MAP[result.trend];
  const deltaLabel =
    result.deltaZ === null
      ? null
      : result.deltaZ >= 0
        ? `Naik ${result.deltaZ.toFixed(2)} poin`
        : `Turun ${Math.abs(result.deltaZ).toFixed(2)} poin`;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Badge tone={(copy.tone as BadgeProps["tone"]) ?? TONE_FALLBACK}>
        <Icon
          size={14}
          aria-hidden
          className={cn("shrink-0", result.trend === "monitor" && "rotate-180")}
        />
        <span>{copy.label}</span>
      </Badge>
      {deltaLabel ? (
        <span className="font-medium text-muted-foreground">{deltaLabel}</span>
      ) : null}
      <span className="text-xs text-muted-foreground">{copy.description}</span>
    </div>
  );
}
