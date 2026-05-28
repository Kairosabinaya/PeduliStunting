/**
 * Posyandu services + jadwal imunisasi dasar (Buku KIA 2024 hal. 124–125).
 * ACT 8 menampilkan 4 layanan inti + modal grid imunisasi 0–24 bulan.
 */

export type PosyanduServiceIcon =
  | "measure"
  | "syringe"
  | "spoon"
  | "pill"
  | "stethoscope";

export interface PosyanduService {
  readonly id: string;
  readonly icon: PosyanduServiceIcon;
  readonly title: string;
  readonly description: string;
}

export const POSYANDU_SERVICES: readonly PosyanduService[] = [
  {
    id: "growth-monitoring",
    icon: "measure",
    title: "Pemantauan pertumbuhan",
    description:
      "Berat & panjang/tinggi badan diukur setiap bulan. LiLA dipakai untuk skrining gizi: <11,5 cm gizi buruk, 11,5–12,4 cm gizi kurang, ≥12,4 cm gizi baik.",
  },
  {
    id: "immunization",
    icon: "syringe",
    title: "Imunisasi dasar & lanjutan",
    description:
      "BCG, Polio, DPT-HB-Hib, PCV, RV, Campak-Rubela — semua gratis sesuai jadwal IDL 2024.",
  },
  {
    id: "nutrition-education",
    icon: "spoon",
    title: "Edukasi gizi & MPASI",
    description:
      "Kelas Ibu Hamil, Kelas Ibu Balita, dan konsultasi kader untuk MPASI, ASI, sanitasi, serta pola asuh.",
  },
  {
    id: "supplements",
    icon: "pill",
    title: "Vitamin A & obat cacing",
    description:
      "Vitamin A biru (6–11 bln, 1×/tahun) atau merah (12–60 bln, 2×/tahun: Februari & Agustus). Obat cacing 2×/tahun untuk anak 1–6 tahun.",
  },
] as const;

export type ImmunizationVaccineCategory =
  | "tuberculosis"
  | "polio"
  | "combo"
  | "pneumococcal"
  | "rotavirus"
  | "measles"
  | "hepatitis"
  | "encephalitis";

export interface ImmunizationVaccine {
  /** Stable id used as table row key. */
  readonly id: string;
  /** Short label printed in the row label column. */
  readonly label: string;
  /** Diseases prevented — surfaced as helper text. */
  readonly prevents: string;
  /** Months in which a dose is recommended. */
  readonly recommendedMonths: readonly number[];
  /** Visual category for cell colour mapping. */
  readonly category: ImmunizationVaccineCategory;
}

export const IMMUNIZATION_VACCINES: readonly ImmunizationVaccine[] = [
  {
    id: "hb0",
    label: "HB0 (Hepatitis B)",
    prevents: "Hepatitis B (lahir, dalam 24 jam pertama)",
    recommendedMonths: [0],
    category: "hepatitis",
  },
  {
    id: "bcg",
    label: "BCG",
    prevents: "TBC (tuberkulosis)",
    recommendedMonths: [1],
    category: "tuberculosis",
  },
  {
    id: "opv-ipv",
    label: "Polio (OPV/IPV)",
    prevents: "Polio (lumpuh layu)",
    recommendedMonths: [1, 2, 3, 4, 9],
    category: "polio",
  },
  {
    id: "dpt-hb-hib",
    label: "DPT-HB-Hib",
    prevents: "Difteri, Pertusis, Tetanus, Hep B, Pneumonia & Meningitis Hib",
    recommendedMonths: [2, 3, 4, 18],
    category: "combo",
  },
  {
    id: "pcv",
    label: "PCV",
    prevents: "Pneumonia bakteri pneumokokus",
    recommendedMonths: [2, 3, 12],
    category: "pneumococcal",
  },
  {
    id: "rv",
    label: "Rotavirus (RV)",
    prevents: "Diare berat & dehidrasi",
    recommendedMonths: [2, 3, 4],
    category: "rotavirus",
  },
  {
    id: "mr",
    label: "Campak-Rubela (MR)",
    prevents: "Campak & rubella",
    recommendedMonths: [9, 18],
    category: "measles",
  },
  {
    id: "je",
    label: "Japanese Encephalitis (JE)",
    prevents: "Radang otak — hanya wilayah endemik",
    recommendedMonths: [10],
    category: "encephalitis",
  },
] as const;

/** Months displayed on the immunization grid header (0..24). */
export const IMMUNIZATION_MONTHS: readonly number[] = Array.from(
  { length: 25 },
  (_, i) => i,
);
