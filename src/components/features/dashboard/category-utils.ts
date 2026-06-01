import type { StuntingCategory } from "@/domain/region/value-objects/stunting-category";
import { STUNTING_CATEGORY_THRESHOLDS } from "@/config/map";

/**
 * Presentation-only mapping of a prevalence percent to its ordinal category,
 * using the canonical WHO/Kemenkes thresholds. Used to colour magnitude bars
 * where the DTO carries a number but no category (provinces, movers, tipe gap).
 * Never produces new data — only colours an existing number.
 */
export function categoryFromPrevalence(prevalence: number): StuntingCategory {
  if (prevalence >= STUNTING_CATEGORY_THRESHOLDS.Tinggi.lowerInclusive)
    return "Tinggi";
  if (prevalence >= STUNTING_CATEGORY_THRESHOLDS.Sedang.lowerInclusive)
    return "Sedang";
  return "Rendah";
}
