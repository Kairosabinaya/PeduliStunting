"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

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
 * Faint per-category wash behind the hero, drawn from the map's ordinal ramp so
 * the card reads the same colour family as the predicted-class badge and /peta.
 */
const HERO_TINT: Record<StuntingCategory, string> = {
  Rendah: "bg-ordinal-rendah/10",
  Sedang: "bg-ordinal-sedang/10",
  Tinggi: "bg-ordinal-tinggi/10",
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
        {/* testid: the category also appears in the probability-bar labels and
            the actual-class chip, so there is no unambiguous semantic query for
            the predicted class. It renders as the map's ordinal badge (saturated
            fill + label-shadow) so colour and contrast match /peta. */}
        <motion.div
          key={category}
          data-testid="predicted-class"
          className="mt-2 flex justify-center"
          initial={reduceMotion === true ? false : { scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: reduceMotion === true ? 0 : 0.3,
            ease: "easeOut",
          }}
        >
          <Badge
            tone={CATEGORY_BADGE_TONE[category]}
            className="rounded-2xl px-5 py-2 text-3xl leading-none tracking-tight"
          >
            {category}
          </Badge>
        </motion.div>
        <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>{DASHBOARD_SIMULATOR.actualLabel}:</span>
          <Badge tone={CATEGORY_BADGE_TONE[actualCategory]}>
            {actualCategory}
          </Badge>
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
                    // Per-class bars share the map's red/yellow/green ordinal
                    // palette (Rendah green, Sedang yellow, Tinggi red) so the
                    // "keyakinan model" readout reads the same as /peta.
                    className={cn(
                      "h-full rounded-full",
                      CATEGORY_BG_CLASS[cat],
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
