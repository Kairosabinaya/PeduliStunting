/**
 * Domain content untuk Modul Gizi (Tracker Phase 5). Sumber: Buku KIA 2024
 * brief Section 9. Semua data di sini bersifat referensi-only; tidak ada
 * mutasi terhadap user data. Konstanta dihitung di sini agar UI tetap tipis.
 */

/* ─────────────────────────── ASI ─────────────────────────── */

export const ASI_TARGET_DAYS = 180;

/* ─────────────────────────── MPASI ─────────────────────────── */

export interface MpasiFoodGroup {
  readonly id: string;
  readonly title: string;
  readonly examples: string;
  readonly emphasis?: boolean;
}

/**
 * 8 grup makanan MPASI (Buku KIA 2024). Item bertanda `emphasis` adalah
 * protein hewani yang menurut Kemenkes paling protektif terhadap stunting.
 */
export const MPASI_FOOD_GROUPS: readonly MpasiFoodGroup[] = [
  {
    id: "asi",
    title: "ASI",
    examples: "ASI tetap diberikan hingga usia 2 tahun.",
  },
  {
    id: "makanan-pokok",
    title: "Makanan pokok",
    examples: "Beras, jagung, gandum, sagu, umbi, kentang, singkong.",
  },
  {
    id: "kacang-kacangan",
    title: "Kacang-kacangan",
    examples: "Kedelai, kacang hijau, kacang polong, kacang tanah.",
  },
  {
    id: "susu",
    title: "Susu hewani & turunannya",
    examples: "Susu, keju, yoghurt.",
  },
  {
    id: "daging",
    title: "Daging-dagingan",
    examples: "Ikan, ayam, daging, hati, udang.",
    emphasis: true,
  },
  {
    id: "telur",
    title: "Telur",
    examples: "Ayam, puyuh, bebek.",
    emphasis: true,
  },
  {
    id: "buah-sayur-vitamin-a",
    title: "Buah & sayur kaya Vitamin A",
    examples: "Jeruk, mangga, tomat, bayam, wortel, pepaya.",
  },
  {
    id: "buah-sayur-lain",
    title: "Buah & sayur lainnya",
    examples: "Aneka buah & sayur untuk variasi.",
  },
];

export interface MpasiTextureGuide {
  readonly id: string;
  readonly ageLabel: string;
  readonly texture: string;
  readonly portion: string;
  readonly frequency: string;
}

/**
 * Panduan tekstur & porsi MPASI per rentang usia (Buku KIA 2024).
 */
export const MPASI_TEXTURE_GUIDES: readonly MpasiTextureGuide[] = [
  {
    id: "6-8",
    ageLabel: "6-8 bulan",
    texture: "Disaring (lumat & kental)",
    portion: "2-3 sdm hingga 1/2 mangkok 125 ml",
    frequency: "2-3x utama + 1x selingan",
  },
  {
    id: "9-11",
    ageLabel: "9-11 bulan",
    texture: "Dicincang",
    portion: "1/2 hingga 3/4 mangkok 125-200 ml",
    frequency: "3-4x utama + 1-2x selingan",
  },
  {
    id: "12-23",
    ageLabel: "12-23 bulan",
    texture: "Iris-iris (masak biasa)",
    portion: "3/4 hingga 1 mangkok 250 ml",
    frequency: "3-4x utama + 1-2x selingan",
  },
];

/* ─────────────────────────── Vitamin A ─────────────────────────── */

export type VitAKapsulKind = "vit_a_blue" | "vit_a_red_feb" | "vit_a_red_aug";

export interface VitAKapsulSpec {
  readonly kind: VitAKapsulKind;
  readonly label: string;
  readonly description: string;
  readonly minAgeMonths: number;
  readonly maxAgeMonths: number;
  /** "Bulan kalender" (1=Jan, 2=Feb, ..., 8=Aug). `null` = tidak terikat bulan. */
  readonly calendarMonth: number | null;
}

export const VIT_A_KAPSUL_SPECS: readonly VitAKapsulSpec[] = [
  {
    kind: "vit_a_blue",
    label: "Kapsul biru (100.000 IU)",
    description:
      "Diberikan sekali untuk bayi usia 6-11 bulan, kapan saja sepanjang tahun.",
    minAgeMonths: 6,
    maxAgeMonths: 11,
    calendarMonth: null,
  },
  {
    kind: "vit_a_red_feb",
    label: "Kapsul merah Februari (200.000 IU)",
    description: "Diberikan setiap Februari untuk anak usia 12-59 bulan.",
    minAgeMonths: 12,
    maxAgeMonths: 59,
    calendarMonth: 2,
  },
  {
    kind: "vit_a_red_aug",
    label: "Kapsul merah Agustus (200.000 IU)",
    description: "Diberikan setiap Agustus untuk anak usia 12-59 bulan.",
    minAgeMonths: 12,
    maxAgeMonths: 59,
    calendarMonth: 8,
  },
];

/* ─────────────────────────── Obat cacing ─────────────────────────── */

export const DEWORMING_TARGET_PER_YEAR = 2;
export const DEWORMING_MIN_AGE_MONTHS = 12;
export const DEWORMING_MAX_AGE_MONTHS = 72;
