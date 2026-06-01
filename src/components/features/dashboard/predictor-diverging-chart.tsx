// Hand-rolled diverging bar list (no chart library) so full predictor names
// wrap freely, each row shows its correlation value, and the bars use the brand
// palette. A 20-row centred bar is cheaper as styled divs than a Recharts mount.

import type { DashboardPredictorCorrelation } from "@/application/region/dashboard-dataset";
import { DASHBOARD_ANALYSIS } from "@/config/dashboard";
import { cn } from "@/lib/cn";

import { shadeFillForCorrelation } from "./predictor-shade";

export interface PredictorDivergingChartProps {
  readonly predictors: readonly DashboardPredictorCorrelation[];
}

function formatSigned(value: number): string {
  return `${value >= 0 ? "+" : "-"}${Math.abs(value).toFixed(2)}`;
}

/**
 * Diverging bars of each predictor's signed correlation with stunting, sorted
 * strongest-positive (risk, primary blue, right) to strongest-negative
 * (protective, accent green, left). Bar length and shade encode magnitude; the
 * numeric value is shown per row.
 */
export function PredictorDivergingChart({
  predictors,
}: PredictorDivergingChartProps) {
  const sorted = [...predictors].sort(
    (a, b) => b.corPrevalence - a.corPrevalence,
  );
  const maxAbs = Math.max(
    0.01,
    ...sorted.map((predictor) => Math.abs(predictor.corPrevalence)),
  );

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
        <LegendSwatch
          className="bg-risk"
          label={DASHBOARD_ANALYSIS.riskLabel}
        />
        <LegendSwatch
          className="bg-accent"
          label={DASHBOARD_ANALYSIS.protectiveLabel}
        />
      </div>
      <ul className="space-y-2.5">
        {sorted.map((predictor) => {
          const positive = predictor.corPrevalence >= 0;
          const widthPct = (
            Math.min(1, Math.abs(predictor.corPrevalence) / maxAbs) * 50
          ).toFixed(2);
          const fill = shadeFillForCorrelation(predictor.corPrevalence, maxAbs);
          return (
            <li key={predictor.code} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm leading-snug text-foreground">
                  {predictor.name}
                </span>
                <span
                  className={cn(
                    "shrink-0 font-mono text-sm font-semibold tabular-nums",
                    positive ? "text-risk" : "text-accent-ink",
                  )}
                >
                  {formatSigned(predictor.corPrevalence)}
                </span>
              </div>
              <div
                aria-hidden
                className="relative h-2.5 w-full rounded-full bg-surface-muted"
              >
                <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border-strong" />
                <span
                  className="absolute inset-y-0 rounded-full"
                  style={
                    positive
                      ? {
                          left: "50%",
                          width: `${widthPct}%`,
                          backgroundColor: fill,
                        }
                      : {
                          right: "50%",
                          width: `${widthPct}%`,
                          backgroundColor: fill,
                        }
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function LegendSwatch({
  className,
  label,
}: {
  readonly className: string;
  readonly label: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        aria-hidden
        className={cn("inline-block size-3 rounded-sm", className)}
      />
      {label}
    </span>
  );
}
