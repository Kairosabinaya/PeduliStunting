/**
 * Provinsi yang di-highlight di ACT 10 sebagai bridge ke /map. Daftar
 * berasal dari rilis SSGI 2024 (top performer Bali, JaTim, Kepri) dan
 * skala nasional. Angka exact 2024 menunggu rilis BKPK final; nilai di
 * sini reflektif terhadap headline publik Mei 2025.
 */

export interface ProvinceHighlight {
  readonly id: string;
  readonly label: string;
  readonly prevalencePct: number;
  readonly note: string;
  readonly tone: "success" | "neutral" | "danger";
}

export const PROVINCE_HIGHLIGHTS: readonly ProvinceHighlight[] = [
  {
    id: "bali",
    label: "Bali",
    prevalencePct: 8.6,
    note: "Provinsi terendah nasional",
    tone: "success",
  },
  {
    id: "jatim",
    label: "Jawa Timur",
    prevalencePct: 14.7,
    note: "Sudah di bawah target RPJMN 2029",
    tone: "success",
  },
  {
    id: "kepri",
    label: "Kepulauan Riau",
    prevalencePct: 15.0,
    note: "Tiga terendah nasional",
    tone: "success",
  },
  {
    id: "national",
    label: "Rata-rata nasional",
    prevalencePct: 19.8,
    note: "SSGI 2024",
    tone: "neutral",
  },
  {
    id: "ntt",
    label: "NTT",
    prevalencePct: 32.0,
    note: "Salah satu prevalensi tertinggi",
    tone: "danger",
  },
] as const;
