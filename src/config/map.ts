/**
 * Configuration for the Map page.
 *
 * All literals consumed by the map UI live here so the components remain pure
 * presentation and the experience can be tuned without code edits to the
 * primitives. Years are still resolved from `@/config/years` (single source of
 * truth for the dataset range).
 */

import { MAX_YEAR } from "@/config/years";

import type { StuntingCategory } from "@/domain/region/value-objects/stunting-category";

/** URL search-param key that controls the active year on the Map page. */
export const MAP_YEAR_PARAM = "tahun";

/**
 * URL search-param key that selects the data source rendered on the map:
 *   - `"actual"`   → observed `y_category` from `region_indicators`.
 *   - `"predicted"`→ `predicted_category` from `model_predictions`.
 */
export const MAP_SOURCE_PARAM = "sumber";

export const MAP_SOURCES = ["actual", "predicted"] as const;
export type MapSource = (typeof MAP_SOURCES)[number];
export const DEFAULT_MAP_SOURCE: MapSource = "actual";

export const DEFAULT_MAP_YEAR = MAX_YEAR;

/** URL search-param key that drives the side panel (selected `kode_bps`). */
export const MAP_SELECTION_PARAM = "wilayah";

/**
 * Bounding box covering the Indonesian archipelago (lon/lat, WGS84). Used to
 * project GeoJSON onto a fixed SVG viewBox without pulling in a heavyweight
 * geographic projection library. Padding is intentional so coastlines never
 * touch the canvas edge.
 */
export const INDONESIA_BBOX = {
  minLon: 94.5,
  maxLon: 141.5,
  minLat: -11.5,
  maxLat: 6.5,
} as const;

/** SVG viewBox dimensions for the choropleth canvas (logical units). */
export const MAP_VIEWBOX = {
  width: 1000,
  height: 380,
} as const;

/**
 * Mapping from {@link StuntingCategory} to the Tailwind classes that already
 * encode WCAG-AA-safe fill + foreground combinations. Components rely on this
 * map so a token change automatically propagates to every surface.
 */
export const CATEGORY_FILL_CLASS: Record<StuntingCategory, string> = {
  Rendah: "fill-ordinal-rendah",
  Sedang: "fill-ordinal-sedang",
  Tinggi: "fill-ordinal-tinggi",
};

export const CATEGORY_BG_CLASS: Record<StuntingCategory, string> = {
  Rendah: "bg-ordinal-rendah",
  Sedang: "bg-ordinal-sedang",
  Tinggi: "bg-ordinal-tinggi",
};

export const CATEGORY_TEXT_CLASS: Record<StuntingCategory, string> = {
  Rendah: "text-ordinal-rendah",
  Sedang: "text-ordinal-sedang",
  Tinggi: "text-ordinal-tinggi",
};

export const CATEGORY_BADGE_TONE: Record<
  StuntingCategory,
  "rendah" | "sedang" | "tinggi"
> = {
  Rendah: "rendah",
  Sedang: "sedang",
  Tinggi: "tinggi",
};

/** Display order used by every UI surface (legend, summary, popup tabs). */
export const CATEGORY_ORDER: readonly StuntingCategory[] = [
  "Rendah",
  "Sedang",
  "Tinggi",
];

/**
 * Cut-off thresholds for the ordinal stunting category, expressed as
 * exclusive upper bounds on `y1_prevalence` (percent). The dataset already
 * carries the assigned category column `Y`; we expose the thresholds in the
 * UI explainer so users understand WHO/Kemenkes scoring without reading
 * Bab4. Source: WHO 2018 — Prevalence cut-offs for malnutrition in children
 * under 5 years (Stunting public-health significance: <2.5% very low, 2.5-<10%
 * low, 10-<20% medium, 20-<30% high, ≥30% very high). We collapse to three
 * tiers to match the model's ordinal Y.
 */
export const STUNTING_CATEGORY_THRESHOLDS = {
  Rendah: { upperExclusive: 20, label: "< 20%" },
  Sedang: {
    lowerInclusive: 20,
    upperExclusive: 30,
    label: "20% – 29.9%",
  },
  Tinggi: { lowerInclusive: 30, label: "≥ 30%" },
} as const;

/**
 * Long-form legend copy ordered from lowest prevalence to highest. The
 * description is used as the accessible label for the swatch.
 */
export interface MapLegendEntry {
  readonly category: StuntingCategory;
  readonly title: string;
  readonly description: string;
}

export const MAP_LEGEND: readonly MapLegendEntry[] = [
  {
    category: "Rendah",
    title: "Rendah",
    description: "Prevalensi stunting rendah (kategori Y).",
  },
  {
    category: "Sedang",
    title: "Sedang",
    description: "Prevalensi stunting sedang (kategori Y).",
  },
  {
    category: "Tinggi",
    title: "Tinggi",
    description: "Prevalensi stunting tinggi (kategori Y).",
  },
] as const;

export interface MapSourceOption {
  readonly value: MapSource;
  readonly label: string;
  readonly hint: string;
}

export const MAP_SOURCE_OPTIONS: readonly MapSourceOption[] = [
  {
    value: "actual",
    label: "Data observasi",
    hint: "Kategori Y dari Dataset SSGI/SKI.",
  },
  {
    value: "predicted",
    label: "Prediksi model",
    hint: "Kategori hasil GTWENOLR (versi default).",
  },
] as const;

export const MAP_COPY = {
  eyebrow: "Sebaran prevalensi",
  title: "Peta stunting Indonesia",
  description:
    "Pilih tahun observasi dan bandingkan kategori stunting hasil dataset SSGI/SKI dengan prediksi model GTWENOLR untuk setiap kabupaten/kota.",
  legendTitle: "Legenda",
  legendDescription: "Tiga kelas ordinal kategori stunting.",
  selectionEmptyTitle: "Belum ada wilayah dipilih",
  selectionEmptyDescription:
    "Klik salah satu wilayah pada peta untuk melihat riwayat indikator dan probabilitas prediksi model.",
  noBoundariesTitle: "Batas wilayah belum tersedia",
  noBoundariesDescription:
    "Jalankan skrip import-boundaries untuk memuat geometri GeoJSON kabupaten/kota.",
  noPredictionsTitle: "Prediksi model belum tersedia",
  noPredictionsDescription:
    "Tampilan ini mengikuti kategori observasi sampai prediksi model di-import untuk versi default.",
  noYearDataTitle: "Belum ada data untuk tahun ini",
  noYearDataDescription:
    "Pilih tahun lain pada slider atau jalankan import indikator terlebih dahulu.",
  changeYearLabel: "Tahun observasi",
  selectionLabel: "Detail wilayah",
} as const;

/** Floating "Ringkasan Nasional" card copy. */
export const MAP_SUMMARY_COPY = {
  eyebrow: "Ringkasan Nasional",
  title: "Indonesia",
  averagePrevalenceLabel: "Rata-rata prevalensi",
  distributionTitle: "Distribusi kategori",
  totalRegionsLabel: "wilayah dipetakan",
  modelBadgePrefix: "Model",
} as const;

/** Floating "Apa itu kategori stunting?" explainer copy. */
export const STUNTING_INFO_COPY = {
  triggerClosed: "Apa itu kategori stunting?",
  triggerOpen: "Sembunyikan penjelasan",
  shortTagline:
    "Skor kategori dari prevalensi stunting kabupaten/kota berdasarkan ambang WHO.",
  categories: {
    Rendah: {
      headline: "Rendah",
      tagline: "Prevalensi di bawah 20%.",
      detail:
        "Kategori prevalensi rendah menurut WHO (low public-health significance). Diperlukan pemantauan rutin agar tren tidak naik kembali.",
    },
    Sedang: {
      headline: "Sedang",
      tagline: "Prevalensi 20% sampai di bawah 30%.",
      detail:
        "Termasuk kategori prevalensi tinggi menurut WHO. Penanganan lintas-sektor (gizi, sanitasi, edukasi) direkomendasikan.",
    },
    Tinggi: {
      headline: "Tinggi",
      tagline: "Prevalensi 30% ke atas.",
      detail:
        "WHO menyebut sebagai very high public-health significance. Intervensi sensitif & spesifik gizi perlu dipercepat.",
    },
  },
  footnote:
    "Kategori `Y` diambil apa adanya dari kolom resmi Dataset SSGI/SKI; ambang di sini ditampilkan untuk membantu pembacaan, bukan untuk dihitung ulang oleh UI.",
} as const;

/** Region detail popup (replaces the legacy right-rail panel). */
export const MAP_DETAIL_COPY = {
  eyebrow: "Detail wilayah",
  prevalenceLabel: "Prevalensi stunting",
  rankLabel: "Peringkat nasional",
  rankUnavailable: "Belum tersedia",
  typeLabel: "Tipe wilayah",
  historyTitlePrefix: "Riwayat",
  historyEmpty:
    "Belum ada data riwayat untuk wilayah ini. Coba pilih tahun lain.",
  closeLabel: "Tutup",
  observedAxisLabel: "Observasi",
  prevalenceAxisLabel: "Prevalensi",
  predictionCta: "Lihat prediksi wilayah ini",
  predictionCtaAriaLabel: (region: string) =>
    `Buka simulasi prediksi untuk ${region}`,
} as const;

/** Vertical year rail (sits at the edge of the map). */
export const YEAR_RAIL_COPY = {
  title: "Tahun",
  ariaLabel: "Pilih tahun observasi",
  pendingHint: "Memuat …",
} as const;

/**
 * Snap points (as ratios of the dynamic viewport height) for the mobile
 * bottom sheet. `peek` is the default landing state: shows summary header
 * without obscuring most of the map. `half` is the comfortable reading
 * state. `full` is the immersive state that scrolls a long history table.
 *
 * Kept conservative — 0.94 instead of 1.0 so the drag handle never collides
 * with the iOS Dynamic Island in `viewport-fit=cover` mode.
 */
export const SHEET_SNAPS = {
  peek: 0.22,
  half: 0.6,
  full: 0.94,
} as const;

/** Copy for the mobile bottom sheet primitive used on `/map`. */
export const MAP_SHEET_COPY = {
  dragHandleAria: "Tarik untuk perluas atau ciutkan panel",
  inlineInfoSummary: "Tentang peta",
} as const;

/** Search input copy and limits. */
export const MAP_SEARCH_COPY = {
  placeholder: "Cari kabupaten/kota…",
  ariaLabel: "Cari wilayah pada peta",
  emptyTitle: "Tidak ada wilayah ditemukan",
  emptyDescription: "Coba ejaan lain atau pakai nama provinsi.",
  resultsAriaLabel: "Hasil pencarian wilayah",
  clearLabel: "Bersihkan kueri",
} as const;

/** Maximum results shown in the search dropdown. */
export const MAP_SEARCH_MAX_RESULTS = 8;

/** Onboarding modal — bespoke for the Peduli Stunting domain. */
export type OnboardingIcon = "map" | "calendar" | "click" | "legend" | "model";

export interface OnboardingStep {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly bullets: readonly string[];
  readonly icon: OnboardingIcon;
}

export const MAP_ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    id: "intro",
    title: "Peta sebaran stunting Indonesia",
    description:
      "Choropleth 514 kabupaten/kota dengan tiga kelas ordinal: Rendah, Sedang, Tinggi.",
    bullets: [
      "Data observasi resmi Kementerian Kesehatan (SSGI 2021, 2022, 2024 + SKI 2023).",
      "Geometri batas wilayah disederhanakan agar tetap ringan di jaringan lambat.",
      "Setiap wilayah bisa diklik untuk membuka panel detail.",
    ],
    icon: "map",
  },
  {
    id: "timeline",
    title: "Telusuri per tahun",
    description:
      "Geser timeline tahun 2021 – 2024 di sisi kanan untuk melihat perubahan pola.",
    bullets: [
      "Tahun aktif disorot di rel vertikal; gunakan tombol panah keyboard untuk berpindah.",
      "URL ikut berubah, jadi kamu bisa share tautan tahun tertentu.",
    ],
    icon: "calendar",
  },
  {
    id: "select",
    title: "Klik wilayah untuk detail",
    description: "Panel detail memunculkan ringkasan kabupaten/kota terpilih.",
    bullets: [
      "Skor prevalensi terbaru + badge kategori.",
      "Peringkat nasional dan tipe wilayah (Kabupaten/Kota).",
      "Riwayat 2021 – 2024 dengan tahun aktif disorot.",
    ],
    icon: "click",
  },
  {
    id: "categories",
    title: "Apa arti warna?",
    description:
      "Hijau untuk prevalensi rendah, kuning untuk sedang, merah untuk tinggi.",
    bullets: [
      "Ambang mengikuti WHO: <20%, 20%–29.9%, ≥30%.",
      "Kategori diambil dari kolom Y resmi peneliti, bukan diturunkan ulang oleh UI.",
      "Toggle ke 'Prediksi model' untuk membandingkan dengan output GTWENOLR.",
    ],
    icon: "legend",
  },
] as const;

export const ONBOARDING_COPY = {
  reopenLabel: "Buka panduan",
  closeLabel: "Tutup",
  nextLabel: "Lanjut",
  prevLabel: "Kembali",
  finishLabel: "Mulai eksplorasi",
  stepIndicatorLabel: (current: number, total: number) =>
    `Langkah ${current} dari ${total}`,
} as const;

/**
 * localStorage key for the "user has seen the onboarding once" flag. Versioned
 * (`-v1`) so a future content revision can re-trigger the modal by bumping the
 * suffix without orphaning user preferences.
 */
export const ONBOARDING_STORAGE_KEY = "peduli-stunting:map-onboarding-seen-v1";
