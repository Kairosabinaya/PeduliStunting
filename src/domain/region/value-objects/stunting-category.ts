export const STUNTING_CATEGORIES = ["Rendah", "Sedang", "Tinggi"] as const;

export type StuntingCategory = (typeof STUNTING_CATEGORIES)[number];

export function isStuntingCategory(value: string): value is StuntingCategory {
  return (STUNTING_CATEGORIES as readonly string[]).includes(value);
}
