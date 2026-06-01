"use client";

import { motion, useReducedMotion } from "motion/react";

import { Badge } from "@/components/primitives/badge";
import { EmptyState } from "@/components/primitives/empty-state";
import { BASELINE_FULL_NAMES, DASHBOARD_MODEL } from "@/config/dashboard";
import { parseBaselines } from "@/schemas/model";
import { cn } from "@/lib/cn";

export interface BaselinesComparisonProps {
  readonly metrics: Readonly<Record<string, unknown>>;
}

function formatName(name: string): string {
  return BASELINE_FULL_NAMES[name] ?? name.replace(/_/gu, " ");
}

/**
 * Out-of-sample accuracy of every candidate model as an animated bar list, with
 * the chosen GTWENOLR adaptive specification highlighted. QWK shows on hover /
 * inline. Reads `metrics.baselines`; bars animate in (reduced-motion aware).
 */
export function BaselinesComparison({ metrics }: BaselinesComparisonProps) {
  const reduceMotion = useReducedMotion();
  const animate = reduceMotion !== true;
  const baselines = parseBaselines(metrics);

  if (baselines.length === 0) {
    return (
      <EmptyState
        title={DASHBOARD_MODEL.baselinesEmptyTitle}
        description={DASHBOARD_MODEL.baselinesEmptyDescription}
      />
    );
  }

  return (
    <ul className="space-y-3">
      {baselines.map((entry, index) => {
        const accuracy = entry.accuracyOut ?? 0;
        const pct = Math.max(0, Math.min(100, accuracy * 100));
        const highlighted = entry.name === DASHBOARD_MODEL.highlightModel;
        return (
          <li
            key={entry.name}
            className="group rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-muted"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
              <span className="flex items-center gap-2 text-foreground">
                {formatName(entry.name)}
                {highlighted ? (
                  <Badge tone="primary">{DASHBOARD_MODEL.highlightBadge}</Badge>
                ) : null}
              </span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {DASHBOARD_MODEL.accuracyLabel}{" "}
                <span className="font-semibold text-foreground">
                  {accuracy.toFixed(3)}
                </span>
                {entry.qwkOut !== null ? (
                  <span>
                    {" "}
                    · {DASHBOARD_MODEL.qwkLabel} {entry.qwkOut.toFixed(2)}
                  </span>
                ) : null}
              </span>
            </div>
            <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-surface-muted">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  highlighted
                    ? "bg-gradient-to-r from-success to-accent"
                    : "bg-accent/60",
                )}
                initial={animate ? { width: 0 } : false}
                animate={{ width: `${pct}%` }}
                transition={{
                  duration: animate ? 0.6 : 0,
                  delay: animate ? Math.min(index * 0.06, 0.4) : 0,
                  ease: "easeOut",
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
