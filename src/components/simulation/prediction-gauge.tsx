/** PredictionGauge — horizontal stacked bar showing stunting prediction probabilities. */
"use client";

import type { PredictionResult } from "@/types/database";
import { STUNTING_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PredictionGaugeProps {
  prediction: PredictionResult | null;
}

const CATEGORIES = [
  { key: "pRendah" as const, label: "Rendah", color: STUNTING_COLORS.Rendah },
  { key: "pSedang" as const, label: "Sedang", color: STUNTING_COLORS.Sedang },
  { key: "pTinggi" as const, label: "Tinggi", color: STUNTING_COLORS.Tinggi },
];

export function PredictionGauge({ prediction }: PredictionGaugeProps) {
  if (!prediction) {
    return (
      <div className="space-y-3">
        <div className="h-8 rounded-full bg-primary-100 animate-pulse" />
        <div className="flex justify-between">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 w-16 rounded bg-primary-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Category badge */}
      <div className="flex items-center justify-center gap-2">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{
            backgroundColor: STUNTING_COLORS[prediction.predictedCategory],
          }}
        />
        <span className="text-lg font-semibold">
          {prediction.predictedCategory}
        </span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-8 rounded-full overflow-hidden">
        {CATEGORIES.map(({ key, label, color }) => {
          const pct = prediction[key] * 100;
          if (pct < 0.5) return null;
          return (
            <div
              key={key}
              className="flex items-center justify-center text-xs font-medium text-white transition-all duration-300"
              style={{ width: `${pct}%`, backgroundColor: color }}
              title={`${label}: ${pct.toFixed(1)}%`}
            >
              {pct >= 10 && `${pct.toFixed(0)}%`}
            </div>
          );
        })}
      </div>

      {/* Percentage labels */}
      <div className="flex justify-between text-xs">
        {CATEGORIES.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-foreground/60">{label}</span>
            <span className="font-medium">
              {(prediction[key] * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
