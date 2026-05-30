/**
 * Konstanta dan referensi statis untuk modul Kehamilan (Tracker Phase 6).
 * Sumber: Buku KIA 2024 brief Section 10. Semua data referensi-only.
 */

/* ─────────────────────────── usia kehamilan ─────────────────────────── */

export const PREGNANCY_TOTAL_WEEKS = 40;
export const PREGNANCY_TRIMESTER_BOUNDARIES = {
  /** Trimester 1: minggu 0-12 (inklusif). */
  t1End: 12,
  /** Trimester 2: minggu 13-27 (inklusif). */
  t2End: 27,
  /** Trimester 3: minggu 28+. */
} as const;

/* ─────────────────────────── ANC ─────────────────────────── */

export interface AncTargetSlot {
  readonly visitNumber: number;
  readonly trimester: 1 | 2 | 3;
  readonly minWeek: number;
  readonly maxWeek: number;
  readonly description: string;
  readonly recommendedByDoctor: boolean;
  readonly recommendUsg: boolean;
}

/**
 * Target minimal 6 kunjungan ANC menurut Buku KIA 2024:
 *   - 1x di trimester 1 (oleh dokter, dengan USG)
 *   - 2x di trimester 2 (bidan/dokter)
 *   - 3x di trimester 3 (salah satunya oleh dokter dengan USG)
 */
export const ANC_TARGET_SLOTS: readonly AncTargetSlot[] = [
  {
    visitNumber: 1,
    trimester: 1,
    minWeek: 0,
    maxWeek: 12,
    description: "Kunjungan pertama oleh dokter dengan USG.",
    recommendedByDoctor: true,
    recommendUsg: true,
  },
  {
    visitNumber: 2,
    trimester: 2,
    minWeek: 13,
    maxWeek: 20,
    description: "Kunjungan kedua di trimester 2 (bidan atau dokter).",
    recommendedByDoctor: false,
    recommendUsg: false,
  },
  {
    visitNumber: 3,
    trimester: 2,
    minWeek: 21,
    maxWeek: 27,
    description: "Kunjungan ketiga di trimester 2 (bidan atau dokter).",
    recommendedByDoctor: false,
    recommendUsg: false,
  },
  {
    visitNumber: 4,
    trimester: 3,
    minWeek: 28,
    maxWeek: 32,
    description: "Kunjungan keempat di trimester 3 (bidan atau dokter).",
    recommendedByDoctor: false,
    recommendUsg: false,
  },
  {
    visitNumber: 5,
    trimester: 3,
    minWeek: 33,
    maxWeek: 36,
    description: "Kunjungan kelima oleh dokter dengan USG.",
    recommendedByDoctor: true,
    recommendUsg: true,
  },
  {
    visitNumber: 6,
    trimester: 3,
    minWeek: 37,
    maxWeek: 40,
    description: "Kunjungan keenam menjelang persalinan.",
    recommendedByDoctor: false,
    recommendUsg: false,
  },
];

/* ─────────────────────────── kenaikan berat ─────────────────────────── */

/**
 * Rekomendasi total kenaikan berat selama kehamilan menurut Buku KIA 2024.
 * Rentang 5-18 kg sesuai status gizi awal ibu. Tabel sederhana berdasarkan
 * IMT pra-hamil (BB lahir / (TB/100)^2).
 */
export interface WeightGainGuide {
  readonly minBmi: number;
  readonly maxBmi: number;
  readonly minGainKg: number;
  readonly maxGainKg: number;
  readonly label: string;
}

export const WEIGHT_GAIN_GUIDES: readonly WeightGainGuide[] = [
  {
    minBmi: 0,
    maxBmi: 18.4,
    minGainKg: 12.5,
    maxGainKg: 18,
    label: "Kurus (IMT < 18.5)",
  },
  {
    minBmi: 18.5,
    maxBmi: 24.9,
    minGainKg: 11.5,
    maxGainKg: 16,
    label: "Normal (IMT 18.5-24.9)",
  },
  {
    minBmi: 25,
    maxBmi: 29.9,
    minGainKg: 7,
    maxGainKg: 11.5,
    label: "Berat lebih (IMT 25-29.9)",
  },
  {
    minBmi: 30,
    maxBmi: 60,
    minGainKg: 5,
    maxGainKg: 9,
    label: "Obesitas (IMT >= 30)",
  },
];

/* ─────────────────────────── milestone janin ─────────────────────────── */

export interface FetalMilestone {
  readonly fromWeek: number;
  readonly toWeek: number;
  readonly title: string;
  readonly size: string;
  readonly comparison: string;
  readonly note: string;
}

/**
 * Milestone janin (perkembangan + ukuran perbandingan) per rentang minggu.
 * Konten ringkas — sengaja sebagai mental anchor, bukan panduan medis.
 */
export const FETAL_MILESTONES: readonly FetalMilestone[] = [
  {
    fromWeek: 4,
    toWeek: 7,
    title: "Awal pembentukan",
    size: "sekitar 1 cm",
    comparison: "seukuran biji apel",
    note: "Tabung saraf, jantung, dan paru-paru mulai terbentuk.",
  },
  {
    fromWeek: 8,
    toWeek: 12,
    title: "Akhir trimester 1",
    size: "sekitar 5 cm",
    comparison: "seukuran jeruk nipis",
    note: "Organ utama lengkap; jantung berdetak teratur.",
  },
  {
    fromWeek: 13,
    toWeek: 17,
    title: "Awal trimester 2",
    size: "sekitar 12 cm",
    comparison: "seukuran apel kecil",
    note: "Janin mulai bergerak; jenis kelamin dapat terlihat di USG.",
  },
  {
    fromWeek: 18,
    toWeek: 22,
    title: "Trimester 2 tengah",
    size: "sekitar 25 cm",
    comparison: "seukuran jagung",
    note: "Ibu mulai merasakan gerakan janin (quickening).",
  },
  {
    fromWeek: 23,
    toWeek: 27,
    title: "Akhir trimester 2",
    size: "sekitar 35 cm",
    comparison: "seukuran terong",
    note: "Paru-paru berkembang; janin dapat mendengar suara dari luar.",
  },
  {
    fromWeek: 28,
    toWeek: 32,
    title: "Awal trimester 3",
    size: "sekitar 40 cm",
    comparison: "seukuran kelapa",
    note: "Penambahan berat janin signifikan; siklus tidur-bangun mulai.",
  },
  {
    fromWeek: 33,
    toWeek: 36,
    title: "Trimester 3 tengah",
    size: "sekitar 45 cm",
    comparison: "seukuran melon kecil",
    note: "Posisi janin menetap; persiapan menyusui dimulai.",
  },
  {
    fromWeek: 37,
    toWeek: 40,
    title: "Siap dilahirkan",
    size: "sekitar 50 cm",
    comparison: "seukuran semangka",
    note: "Janin matang dan siap dilahirkan kapan saja.",
  },
];
