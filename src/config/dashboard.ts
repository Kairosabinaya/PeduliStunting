/**
 * UI copy and structural constants for the `/dashboard` route. Centralised so
 * the page itself contains zero hardcoded customer-facing strings — every
 * label is editable from this file alone, per project guidelines §2.2.
 *
 * The dashboard renders ONLY data sourced from `model_metadata`,
 * `model_predictions`, `model_coefficients`, and `indicator_dictionary`. This
 * file holds the surrounding presentation copy and the metric/Moran display
 * mapping that the page uses when it interprets the free-form JSON blobs
 * stored in `model_metadata.metrics` and `model_metadata.moran_per_year`.
 */

/** Page-level header copy. */
export const DASHBOARD_HEADER = {
  eyebrow: "Model & evaluasi",
  title: "Dashboard model stunting",
  description:
    "Ringkasan model GTWENOLR: metrik final, perbandingan kandidat model, autokorelasi spasial per tahun, kamus prediktor, dan simulasi what-if.",
} as const;

/** Copy for the "final metrics" snapshot section. */
export const DASHBOARD_METRICS_SECTION = {
  title: "Metrik final model default",
  description:
    "Skor evaluasi out-of-sample untuk versi model yang sedang aktif di seluruh aplikasi.",
  loadingLabel: "Memuat metrik model default.",
  errorTitle: "Tidak bisa memuat metrik model default",
  emptyTitle: "Belum ada model default",
  emptyDescription:
    "Tandai salah satu versi pada tabel model_metadata sebagai default agar metriknya tampil di sini.",
  noMetricsTitle: "Metrik belum tersedia",
  noMetricsDescription:
    "JSON `metrics` pada model default masih kosong. Jalankan skrip ekspor R untuk mengisinya.",
} as const;

/**
 * Ordered metric mapping. The dashboard reads each key from
 * `model_metadata.metrics` and renders the metric tile when the value is
 * numeric. Unknown keys are listed in the "lainnya" overflow.
 */
export interface MetricTileDefinition {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  /** Decimal places when rendering. */
  readonly precision: number;
  /** True if higher is better — drives the comparative arrow. */
  readonly higherIsBetter: boolean;
}

export const DASHBOARD_METRIC_TILES: readonly MetricTileDefinition[] = [
  {
    key: "accuracy",
    label: "Akurasi",
    description: "Proporsi prediksi kelas yang tepat pada data validasi.",
    precision: 3,
    higherIsBetter: true,
  },
  {
    key: "qwk",
    label: "Quadratic Weighted Kappa",
    description: "Kesepakatan terbobot — menghukum loncatan kategori lebih berat.",
    precision: 3,
    higherIsBetter: true,
  },
  {
    key: "mae",
    label: "Mean Absolute Error",
    description:
      "Selisih rata-rata antara kategori prediksi dan observasi (0-2).",
    precision: 3,
    higherIsBetter: false,
  },
  {
    key: "log_score",
    label: "Log-score",
    description:
      "Skor logaritmik probabilitas — semakin mendekati nol semakin baik.",
    precision: 3,
    higherIsBetter: true,
  },
];

/** Copy + display configuration for the 6-model comparison table. */
export const DASHBOARD_COMPARISON_SECTION = {
  title: "Perbandingan kandidat model",
  description:
    "Skor evaluasi yang dilaporkan model_metadata.metrics.models pada model default. Baris dengan tanda khusus menunjukkan model yang dipilih sebagai default.",
  loadingLabel: "Memuat perbandingan model.",
  errorTitle: "Tidak bisa memuat perbandingan model",
  emptyTitle: "Belum ada perbandingan kandidat",
  emptyDescription:
    "Field `metrics.models` pada model default kosong. Tambahkan array kandidat saat mengekspor metrik dari R.",
  columns: {
    name: "Model",
    accuracy: "Akurasi",
    qwk: "QWK",
    mae: "MAE",
    logScore: "Log-score",
    selected: "Status",
  },
  selectedBadge: "Default",
  archivedBadge: "Kandidat",
} as const;

/** Copy + display for the Moran's I per year section. */
export const DASHBOARD_MORAN_SECTION = {
  title: "Autokorelasi spasial (Moran's I) per tahun",
  description:
    "Indeks Moran's I residual model. Nilai positif menandakan klaster spasial — model masih meninggalkan struktur geografis. Mendekati nol berarti residual tersebar acak.",
  loadingLabel: "Memuat Moran's I per tahun.",
  errorTitle: "Tidak bisa memuat Moran's I",
  emptyTitle: "Belum ada nilai Moran's I",
  emptyDescription:
    "Field `moran_per_year` pada model default kosong. Jalankan kembali script evaluasi spasial.",
  valueLabel: "Moran's I",
  pValueLabel: "p-value",
  significantBadge: "Signifikan (p<0.05)",
  notSignificantBadge: "Tidak signifikan",
} as const;

/** Copy for the predictor dictionary section. */
export const DASHBOARD_DICTIONARY_SECTION = {
  title: "Kamus prediktor X1-X20",
  description:
    "Definisi resmi setiap prediktor yang dipakai model. Dikelompokkan per dimensi: sosial-ekonomi, layanan kesehatan, lingkungan, demografi, dan gizi.",
  loadingLabel: "Memuat kamus prediktor.",
  errorTitle: "Tidak bisa memuat kamus prediktor",
  emptyTitle: "Kamus prediktor belum tersedia",
  emptyDescription:
    "Tabel indicator_dictionary masih kosong. Jalankan migrasi data referensi sebelum melanjutkan.",
  sourceLabel: "Sumber",
  unitLabel: "Satuan",
} as const;

/** Copy for the protective vs risk contribution section. */
export const DASHBOARD_CONTRIBUTION_SECTION = {
  title: "Kontribusi prediktor",
  description:
    "Pengelompokan prediktor berdasarkan arah pengaruh terhadap kategori stunting. Protektif = peningkatan nilai mengurangi risiko; risiko = peningkatan nilai memperbesar risiko.",
  protectiveTitle: "Protektif",
  protectiveDescription:
    "Peningkatan nilai indikator ini diharapkan menurunkan kategori stunting.",
  riskTitle: "Risiko",
  riskDescription:
    "Peningkatan nilai indikator ini diharapkan menaikkan kategori stunting.",
  neutralTitle: "Belum ditandai",
  neutralDescription:
    "Indikator belum diberi arah pengaruh pada kamus. Tambahkan kolom `effect_direction` pada migrasi referensi.",
  loadingLabel: "Memuat kontribusi prediktor.",
  emptyTitle: "Belum ada indikator dengan arah pengaruh",
  emptyDescription:
    "Lengkapi kolom `effect_direction` pada indicator_dictionary agar kontribusi tampil di sini.",
} as const;

/** Copy and bounds for the what-if simulator. */
export const DASHBOARD_WHATIF_SECTION = {
  title: "Simulasi what-if prediktor",
  description:
    "Geser nilai prediktor untuk melihat estimasi pergeseran log-odds rata-rata terhadap kategori observasi. Estimasi memakai rata-rata koefisien lokal model (GTWENOLR) di seluruh kabupaten/kota.",
  loadingLabel: "Memuat koefisien model.",
  errorTitle: "Tidak bisa memuat koefisien model",
  noCoefficientsTitle: "Koefisien model belum tersedia",
  noCoefficientsDescription:
    "Slider what-if membutuhkan ekspor `model_coefficients` dari skrip R. Selagi menunggu, lihat ringkasan deskriptif arah pengaruh pada bagian Kontribusi Prediktor di atas.",
  selectPredictorLabel: "Pilih prediktor",
  yearFilterLabel: "Tahun referensi",
  yearAllOption: "Semua tahun",
  deltaLabel: "Perubahan nilai prediktor (\u0394)",
  deltaHint:
    "Bandingkan dengan kondisi observasi: positif = naik, negatif = turun.",
  estimatedShiftLabel: "Estimasi pergeseran log-odds",
  estimatedShiftHint:
    "Log-odds positif menggeser probabilitas ke kategori lebih tinggi; negatif menurunkan.",
  contributingRegionsLabel: "Kabupaten/kota berkontribusi",
  inferenceBadge: "Inferensi statistik",
  observedBadge: "Estimasi titik",
  formulaCaption:
    "Pergeseran = rata-rata(koefisien lokal) \u00d7 \u0394 nilai prediktor",
} as const;

/** Step range for the what-if delta slider. */
export const DASHBOARD_WHATIF_DELTA = {
  min: -3,
  max: 3,
  step: 0.1,
  default: 0,
} as const;
