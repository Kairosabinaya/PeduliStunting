/**
 * Biological sex used for WHO LMS lookups and Buku KIA 2024 references.
 * `L` (laki-laki) and `P` (perempuan) match the values used by the Indonesian
 * Ministry of Health and the WHO data files we import.
 */
export const SEX_VALUES = ["L", "P"] as const;
export type Sex = (typeof SEX_VALUES)[number];

export function isSex(value: string): value is Sex {
  return (SEX_VALUES as readonly string[]).includes(value);
}
