"use client";

import { motion, useReducedMotion } from "motion/react";

import { Badge } from "@/components/primitives/badge";
import { DASHBOARD_SIMULATOR } from "@/config/dashboard";
import {
  CATEGORY_BADGE_TONE,
  CATEGORY_BG_CLASS,
  CATEGORY_ORDER,
} from "@/config/map";
import type { OrdinalProbabilities } from "@/domain/model/services/ordinal-predictor";
import type { StuntingCategory } from "@/domain/region/value-objects/stunting-category";
import { cn } from "@/lib/cn";

export interface PredictionResultProps {
  readonly category: StuntingCategory;
  readonly probabilities: OrdinalProbabilities;
  readonly actualCategory: StuntingCategory;
}

const PROB_KEY: Record<StuntingCategory, keyof OrdinalProbabilities> = {
  Rendah: "rendah",
  Sedang: "sedang",
  Tinggi: "tinggi",
};

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Live prediction readout for the what-if simulator: a prominent predicted-class
 * badge, the observed class for comparison, and an animated probability bar per
 * ordinal class. The bars ease to their new width on every slider change, so the
 * effect of a change is felt instantly. Animation respects reduced-motion.
 */
export function PredictionResult({
  category,
  probabilities,
  actualCategory,
}: PredictionResultProps) {
  const reduceMotion = useReducedMotion();
  const changed = category !== actualCategory;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {DASHBOARD_SIMULATOR.predictedLabel}
        </p>
        {/* testid: the category text also appears in the probability-bar
            labels, the actual-class chip, and the mobile summary bar, so there
            is no unambiguous semantic query for the predicted class. */}
        <Badge
          tone={CATEGORY_BADGE_TONE[category]}
          className="px-4 py-1.5 text-xl"
          data-testid="predicted-class"
        >
          {category}
        </Badge>
        <p className="text-xs text-muted-foreground">
          {DASHBOARD_SIMULATOR.actualLabel}:{" "}
          <span className="font-semibold text-foreground">
            {actualCategory}
          </span>
          {changed ? (
            <span className="ml-1 text-primary">
              {DASHBOARD_SIMULATOR.changedFromActual}
            </span>
          ) : null}
        </p>
      </div>

      <div className="space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {DASHBOARD_SIMULATOR.probabilitiesLabel}
        </p>
        <ul className="space-y-2">
          {CATEGORY_ORDER.map((cat) => {
            const value = probabilities[PROB_KEY[cat]];
            const percent = Math.max(0, Math.min(100, value * 100));
            return (
              <li key={cat} className="space-y-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-foreground">{cat}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {formatPercent(value)}
                  </span>
                </div>
                <div
                  className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted"
                  role="progressbar"
                  aria-label={`Peluang kelas ${cat}`}
                  aria-valuenow={Math.round(percent)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      CATEGORY_BG_CLASS[cat],
                    )}
                    initial={reduceMotion === true ? false : { width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{
                      duration: reduceMotion === true ? 0 : 0.4,
                      ease: "easeOut",
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
