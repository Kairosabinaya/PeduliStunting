import type { StuntingCategory } from "@/domain/region/value-objects/stunting-category";
import { Card } from "@/components/primitives/card";
import { DASHBOARD_LEGEND } from "@/config/dashboard";
import {
  CATEGORY_BG_CLASS,
  CATEGORY_ORDER,
  STUNTING_CATEGORY_THRESHOLDS,
  STUNTING_INFO_COPY,
} from "@/config/map";
import { cn } from "@/lib/cn";

import { SectionHeading } from "./section-heading";

/** Left-accent border per category (methodology-card motif). */
const BORDER_CLASS: Record<StuntingCategory, string> = {
  Rendah: "border-ordinal-rendah",
  Sedang: "border-ordinal-sedang",
  Tinggi: "border-ordinal-tinggi",
};

/**
 * "How to read the categories" explainer. Reuses the canonical WHO/Kemenkes
 * thresholds and taglines from `@/config/map` (no new vocabulary), presented as
 * accent-bordered rows so readers can decode the Rendah/Sedang/Tinggi colours
 * used across the map, rankings, and simulator.
 */
export function CategoryLegend() {
  return (
    <Card padding="md" className="space-y-4">
      <SectionHeading
        title={DASHBOARD_LEGEND.title}
        description={DASHBOARD_LEGEND.description}
      />
      <ul className="grid gap-3 sm:grid-cols-3">
        {CATEGORY_ORDER.map((category) => {
          const copy = STUNTING_INFO_COPY.categories[category];
          const threshold = STUNTING_CATEGORY_THRESHOLDS[category];
          return (
            <li
              key={category}
              className={cn("border-l-4 pl-3", BORDER_CLASS[category])}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={cn(
                      "size-2.5 rounded-full",
                      CATEGORY_BG_CLASS[category],
                    )}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {copy.headline}
                  </span>
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {threshold.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {copy.tagline}
              </p>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
