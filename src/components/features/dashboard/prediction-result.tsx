"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { DASHBOARD_SIMULATOR } from "@/config/dashboard";
import { CATEGORY_ORDER } from "@/config/map";
import type { OrdinalProbabilities } from "@/domain/model/services/ordinal-predictor";
import type { StuntingCategory } from "@/domain/region/value-objects/stunting-category";
import { cn } from "@/lib/cn";

export interface PredictionResultProps {
  readonly category: StuntingCategory;
  readonly probabilities: OrdinalProbabilities;
  readonly actualCategory: StuntingCategory;
  /**
   * `"stacked"` (default) keeps the category hero above the probability bars —
   * the right layout for a narrow column. `"split"` places them side-by-side
   * from `lg` up, used by the full-width banner above the simulator sliders.
   */
  readonly layout?: "stacked" | "split";
  /**
   * Optional control rendered inline with the probabilities heading (top-right),
   * e.g. the simulator's reset button. Kept as a slot so this component stays
   * presentational and the action's logic lives with its owner.
   */
  readonly action?: ReactNode;
}

const PROB_KEY: Record<StuntingCategory, keyof OrdinalProbabilities> = {
  Rendah: "rendah",
  Sedang: "sedang",
  Tinggi: "tinggi",
};

/**
 * Brand-palette ramp for the predicted class (blue/green only — the ordinal
 * red/yellow/green is reserved for the map). Sequential low→high: Rendah sage
 * green, Sedang sky blue, Tinggi primary blue. Exported so the mobile bar in
 * the simulator stays in sync.
 */
export const PREDICTION_BAR_CLASS: Record<StuntingCategory, string> = {
  Rendah: "bg-accent",
  Sedang: "bg-primary-soft",
  Tinggi: "bg-primary",
};

/** Badge tone for the predicted class (brand only). */
export const PREDICTION_BADGE_TONE: Record<
  StuntingCategory,
  "success" | "primary"
> = {
  Rendah: "success",
  Sedang: "primary",
  Tinggi: "primary",
};

/** Category-tinted hero background (low alpha so the big label stays readable). */
const HERO_TINT: Record<StuntingCategory, string> = {
  Rendah: "bg-accent/10",
  Sedang: "bg-primary-soft/15",
  Tinggi: "bg-primary/10",
};

/** Category text colour, AA-safe on the tinted hero (brand). */
const HERO_TEXT: Record<StuntingCategory, string> = {
  Rendah: "text-accent-ink",
  Sedang: "text-primary",
  Tinggi: "text-primary",
};

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Live prediction readout for the what-if simulator. A bold category hero is the
 * centrepiece; below it, one animated probability bar per ordinal class eases to
 * its new width on every slider change so the effect of a change is felt
 * instantly. The dominant class is emphasised. Animation respects reduced-motion.
 */
export function PredictionResult({
  category,
  probabilities,
  actualCategory,
  layout = "stacked",
  action,
}: PredictionResultProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        layout === "split"
          ? "grid gap-4 lg:grid-cols-2 lg:items-center"
          : "space-y-4",
      )}
    >
      <div className={cn("rounded-2xl p-4 text-center", HERO_TINT[category])}>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {DASHBOARD_SIMULATOR.predictedLabel}
        </p>
        {/* testid: the category text also appears in the probability-bar labels
            and the actual-class chip, so there is no unambiguous semantic query
            for the predicted class. */}
        <motion.p
          key={category}
          data-testid="predicted-class"
          className={cn(
            "stat-number mt-1 text-4xl font-bold leading-none tracking-tight",
            HERO_TEXT[category],
          )}
          initial={reduceMotion === true ? false : { scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: reduceMotion === true ? 0 : 0.3,
            ease: "easeOut",
          }}
        >
          {category}
        </motion.p>
        <p className="mt-3 text-xs text-muted-foreground">
          {DASHBOARD_SIMULATOR.actualLabel}:{" "}
          <span className="font-semibold text-foreground">
            {actualCategory}
          </span>
        </p>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {DASHBOARD_SIMULATOR.probabilitiesLabel}
          </p>
          {action}
        </div>
        <ul className="space-y-2">
          {CATEGORY_ORDER.map((cat) => {
            const value = probabilities[PROB_KEY[cat]];
            const percent = Math.max(0, Math.min(100, value * 100));
            const isPredicted = cat === category;
            return (
              <li key={cat} className="space-y-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span
                    className={cn(
                      isPredicted
                        ? "font-semibold text-foreground"
                        : "text-foreground",
                    )}
                  >
                    {cat}
                  </span>
                  <span
                    className={cn(
                      "font-mono tabular-nums",
                      isPredicted
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatPercent(value)}
                  </span>
                </div>
                <div
                  className={cn(
                    "w-full overflow-hidden rounded-full bg-surface-muted",
                    isPredicted ? "h-3" : "h-2.5",
                  )}
                  role="progressbar"
                  aria-label={`Peluang kelas ${cat}`}
                  aria-valuenow={Math.round(percent)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      PREDICTION_BAR_CLASS[cat],
                      !isPredicted && "opacity-70",
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
