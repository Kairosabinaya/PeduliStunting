"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import type { IndicatorDefinitionDto } from "@/application/region/dtos";
import { SegmentedControl } from "@/components/primitives/segmented-control";
import { DASHBOARD_ANALYSIS } from "@/config/dashboard";
import { cn } from "@/lib/cn";

export interface PredictorAnalysisProps {
  /** The 20 predictors, sorted X1..X20. */
  readonly predictors: readonly IndicatorDefinitionDto[];
}

type Metric = "correlation" | "selection";

interface Row {
  readonly code: string;
  readonly name: string;
  readonly value: number;
}

const SEGMENT_ITEMS = [
  { id: "correlation" as const, label: DASHBOARD_ANALYSIS.correlationTitle },
  { id: "selection" as const, label: DASHBOARD_ANALYSIS.selectionTitle },
];

function PredictorBar({
  row,
  metric,
  maxAbsCorr,
  index,
  animate,
}: {
  readonly row: Row;
  readonly metric: Metric;
  readonly maxAbsCorr: number;
  readonly index: number;
  readonly animate: boolean;
}) {
  const transition = {
    duration: animate ? 0.5 : 0,
    delay: animate ? Math.min(index * 0.025, 0.4) : 0,
    ease: "easeOut" as const,
  };

  if (metric === "selection") {
    const pct = Math.max(0, Math.min(100, row.value));
    return (
      <li className="group rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-muted">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="truncate text-foreground" title={row.name}>
            {row.name}
          </span>
          <span className="shrink-0 font-mono text-xs font-semibold tabular-nums text-primary">
            {pct.toFixed(0)}%
          </span>
        </div>
        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-primary"
            initial={animate ? { width: 0 } : false}
            animate={{ width: `${pct}%` }}
            transition={transition}
          />
        </div>
      </li>
    );
  }

  const ratio = Math.min(1, Math.abs(row.value) / maxAbsCorr);
  const half = ratio * 50;
  const positive = row.value >= 0;
  return (
    <li className="group rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-muted">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="truncate text-foreground" title={row.name}>
          {row.name}
        </span>
        <span
          className={cn(
            "shrink-0 font-mono text-xs font-semibold tabular-nums",
            positive ? "text-ordinal-tinggi" : "text-ordinal-rendah-foreground",
          )}
        >
          {row.value > 0 ? "+" : ""}
          {row.value.toFixed(2)}
        </span>
      </div>
      <div className="relative mt-1.5 h-2.5 w-full rounded-full bg-surface-muted">
        <span
          aria-hidden
          className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border-strong"
        />
        <motion.div
          className={cn(
            "absolute top-0 h-full",
            positive
              ? "left-1/2 rounded-r-full bg-ordinal-tinggi"
              : "right-1/2 rounded-l-full bg-ordinal-rendah",
          )}
          initial={animate ? { width: 0 } : false}
          animate={{ width: `${half}%` }}
          transition={transition}
        />
      </div>
    </li>
  );
}

/**
 * Two readable, animated views of the 20 predictors with friendly names: how
 * strongly each relates to prevalence (diverging bar, red = raises risk, green
 * = lowers it) and how often the model actually used it. A toggle switches
 * between them; bars animate in and on hover. Custom (not Recharts) so the
 * Indonesian names are legible and the bars feel lively and on-brand.
 */
export function PredictorAnalysis({ predictors }: PredictorAnalysisProps) {
  const [metric, setMetric] = useState<Metric>("correlation");
  const reduceMotion = useReducedMotion();
  const animate = reduceMotion !== true;

  const correlation = useMemo<readonly Row[]>(
    () =>
      predictors
        .filter((p) => p.model.corPrevalence !== null)
        .map((p) => ({
          code: p.code,
          name: p.name,
          value: p.model.corPrevalence ?? 0,
        }))
        .sort((a, b) => b.value - a.value),
    [predictors],
  );

  const selection = useMemo<readonly Row[]>(
    () =>
      predictors
        .filter((p) => p.model.pctActive !== null)
        .map((p) => ({
          code: p.code,
          name: p.name,
          value: p.model.pctActive ?? 0,
        }))
        .sort((a, b) => b.value - a.value),
    [predictors],
  );

  const maxAbsCorr = Math.max(
    0.01,
    ...correlation.map((r) => Math.abs(r.value)),
  );
  const rows = metric === "correlation" ? correlation : selection;

  return (
    <div className="space-y-4">
      <SegmentedControl
        ariaLabel={DASHBOARD_ANALYSIS.title}
        value={metric}
        onValueChange={setMetric}
        items={SEGMENT_ITEMS}
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-prose text-sm text-muted-foreground">
          {metric === "correlation"
            ? DASHBOARD_ANALYSIS.correlationHint
            : DASHBOARD_ANALYSIS.selectionHint}
        </p>
        {metric === "correlation" ? (
          <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-2.5 rounded-full bg-ordinal-rendah" />
              {DASHBOARD_ANALYSIS.protectiveLabel}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-2.5 rounded-full bg-ordinal-tinggi" />
              {DASHBOARD_ANALYSIS.riskLabel}
            </span>
          </div>
        ) : null}
      </div>
      <ul className="space-y-0.5">
        {rows.map((row, index) => (
          <PredictorBar
            key={row.code}
            row={row}
            metric={metric}
            maxAbsCorr={maxAbsCorr}
            index={index}
            animate={animate}
          />
        ))}
      </ul>
    </div>
  );
}
