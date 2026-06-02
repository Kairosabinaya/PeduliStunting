import type { StuntingCategoryLabel } from "@/application/ai/cards/ai-card";

/** Map a stunting category to a text token. Lower stunting (Rendah) reads green. */
export function categoryTone(category: StuntingCategoryLabel): string {
  switch (category) {
    case "Rendah":
      return "text-success";
    case "Sedang":
      return "text-warning";
    case "Tinggi":
      return "text-danger";
  }
}
