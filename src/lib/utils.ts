/** Shared utility functions. */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely (handles conflicts). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** All 20 predictor column names in the predictor_data table. */
const PREDICTOR_COLUMNS = [
  "x1_ikt", "x2_sanitasi", "x3_air_minum", "x4_kemiskinan",
  "x5_rls_perempuan", "x6_hamil_muda", "x7_asi_eksklusif", "x8_unmet_need",
  "x9_pph", "x10_hunian_layak", "x11_lpp", "x12_persen_penduduk",
  "x13_kepadatan", "x14_rasio_jk", "x15_aps", "x16_buta_aksara",
  "x17_imunisasi", "x18_pengangguran", "x19_ipm", "x20_pengeluaran",
] as const;

/** Convert a predictor_data DB row (wide format) to Record<string, number> keyed by column name. */
export function predictorRowToRecord(
  row: Record<string, unknown>
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const col of PREDICTOR_COLUMNS) {
    const val = row[col];
    if (val !== null && val !== undefined) {
      result[col] = Number(val);
    }
  }
  return result;
}
