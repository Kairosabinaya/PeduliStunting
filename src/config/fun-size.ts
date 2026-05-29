/**
 * Fun-size comparison data for the growth tab. Mapping berat/tinggi anak ke
 * perbandingan yang relatable bagi orang tua — bukan kebijakan medis, hanya
 * mental anchor (mirror pola Ovia di benchmark Phase 2).
 *
 * Konvensi pemilihan:
 *   - Konkret + jujur (mis. "buah semangka kecil"), bukan emoji atau hiperbola.
 *   - Berbasis berat & tinggi yang realistis untuk balita Indonesia.
 *   - Hanya satu perbandingan per ambang; jangan over-fitting.
 *
 * Catatan: bukan rekomendasi gizi atau patokan klinis. Tidak ada "ideal".
 */

export interface WeightComparison {
  /** Berat minimum (kg) saat perbandingan ini mulai berlaku (inclusive). */
  readonly fromKg: number;
  readonly label: string;
}

export interface HeightComparison {
  /** Tinggi minimum (cm) saat perbandingan ini mulai berlaku (inclusive). */
  readonly fromCm: number;
  readonly label: string;
}

export const WEIGHT_COMPARISONS: readonly WeightComparison[] = [
  { fromKg: 0, label: "seukuran beberapa tangkai pisang" },
  { fromKg: 3, label: "seukuran melon kecil" },
  { fromKg: 5, label: "seukuran setoples madu satu kilogram lima" },
  { fromKg: 7, label: "seukuran semangka kecil" },
  { fromKg: 10, label: "seukuran tas ransel sekolah penuh" },
  { fromKg: 13, label: "seukuran karung beras tiga belas kilogram" },
  { fromKg: 17, label: "seukuran galon air mineral penuh" },
  { fromKg: 22, label: "seukuran kursi plastik anak" },
];

export const HEIGHT_COMPARISONS: readonly HeightComparison[] = [
  { fromCm: 0, label: "sepanjang kotak roti tawar besar" },
  { fromCm: 50, label: "sepanjang botol minum besar" },
  { fromCm: 60, label: "sepanjang pijakan kursi taman kanak-kanak" },
  { fromCm: 70, label: "setinggi kursi makan anak" },
  { fromCm: 80, label: "setinggi meja kopi rendah" },
  { fromCm: 90, label: "setinggi pintu lemari bawah" },
  { fromCm: 100, label: "setinggi meja belajar anak" },
  { fromCm: 110, label: "setinggi sandaran kursi taman" },
];

/**
 * Find the most specific weight comparison for the supplied value. Returns
 * `null` when value is missing or negative. The comparisons are sorted by
 * `fromKg` ascending and we pick the highest threshold that the value clears.
 */
export function findWeightComparison(
  weightKg: number | null,
): WeightComparison | null {
  if (weightKg === null || weightKg <= 0) return null;
  let match: WeightComparison | null = null;
  for (const entry of WEIGHT_COMPARISONS) {
    if (weightKg >= entry.fromKg) {
      match = entry;
    } else {
      break;
    }
  }
  return match;
}

export function findHeightComparison(
  heightCm: number | null,
): HeightComparison | null {
  if (heightCm === null || heightCm <= 0) return null;
  let match: HeightComparison | null = null;
  for (const entry of HEIGHT_COMPARISONS) {
    if (heightCm >= entry.fromCm) {
      match = entry;
    } else {
      break;
    }
  }
  return match;
}
