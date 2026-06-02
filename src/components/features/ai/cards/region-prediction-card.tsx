import type { RegionPredictionCard as RegionPredictionCardModel } from "@/application/ai/cards/ai-card";
import { cn } from "@/lib/cn";

import { categoryTone } from "./category-tone";

const PROB_ROWS = [
  { key: "rendah", label: "Rendah" },
  { key: "sedang", label: "Sedang" },
  { key: "tinggi", label: "Tinggi" },
] as const;

/**
 * Renders the model's predicted category + class probabilities for a region/year.
 *
 * @example
 * ```tsx
 * <RegionPredictionCard card={{ type: "region-prediction", kodeBps: "3578", kabupatenKota: "Kota Surabaya", provinsi: "Jawa Timur", tahun: 2025, modelVersion: "v1", predictedCategory: "Rendah", probabilities: { rendah: 0.8, sedang: 0.15, tinggi: 0.05 } }} />
 * ```
 */
export function RegionPredictionCard({
  card,
}: {
  readonly card: RegionPredictionCardModel;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface/70 p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          Prediksi {card.kabupatenKota} {card.tahun}
        </p>
        <span
          className={cn(
            "text-sm font-semibold",
            categoryTone(card.predictedCategory),
          )}
        >
          {card.predictedCategory}
        </span>
      </div>
      <ul className="space-y-1.5">
        {PROB_ROWS.map((row) => {
          const value = card.probabilities[row.key];
          const pct = value !== null ? Math.round(value * 100) : null;
          return (
            <li key={row.key} className="text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{row.label}</span>
                <span className="tabular-nums">
                  {pct !== null ? `${pct}%` : "-"}
                </span>
              </div>
              <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${pct ?? 0}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">
        Estimasi model {card.modelVersion}, bukan data resmi.
      </p>
    </div>
  );
}
