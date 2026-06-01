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

/** Header copy for the `/data` route (Potret Stunting). */
export const DATA_HEADER = {
  eyebrow: "Potret stunting",
  title: "Stunting Indonesia dalam angka",
  description: "Sebaran, tren, dan indikator di 514 kabupaten/kota, 2021-2024.",
} as const;

/** Header copy for the `/prediksi` route (simulator + model). */
export const PREDIKSI_HEADER = {
  eyebrow: "Coba sendiri",
  title: "Simulasi prediksi stunting",
  description: "Geser indikator wilayah, lihat prediksinya berubah.",
} as const;

/** Canonical route for the prediction simulator. */
export const PREDIKSI_ROUTE = "/prediksi";

/**
 * Query param the `/prediksi` page reads to pre-select a region by its BPS
 * code. Mirrors the map's `wilayah` param so a deep-link from the map detail
 * panel opens the simulator already filtered to the same region.
 */
export const PREDIKSI_REGION_PARAM = "wilayah";

/** Deep-link to the simulator pre-filtered to a region. */
export function prediksiRegionHref(kodeBps: string): string {
  return `${PREDIKSI_ROUTE}?${PREDIKSI_REGION_PARAM}=${encodeURIComponent(kodeBps)}`;
}

/** Headline KPI tiles for the insight section. */
export const DASHBOARD_KPI = {
  errorTitle: "Belum bisa menampilkan ringkasan",
  emptyTitle: "Data wilayah belum tersedia",
  emptyDescription:
    "Data indikator wilayah belum dimuat. Jalankan kembali impor data dashboard.",
  meanLabel: "Rata-rata stunting",
  meanHint: "Rata-rata seluruh kabupaten/kota (tiap wilayah dihitung setara).",
  tinggiShareLabel: "Wilayah stunting tinggi",
  tinggiShareHint: "Stunting ≥ 30% (kategori Tinggi).",
  sedangShareLabel: "Wilayah stunting sedang",
  sedangShareHint: "Stunting 20–29,9% (kategori Sedang).",
  rendahShareLabel: "Wilayah stunting rendah",
  rendahShareHint: "Stunting di bawah 20% (kategori Rendah).",
  unitPercent: "%",
  unitPoint: " poin",
} as const;

/** Global cross-filter bar copy (year + region). */
export const DASHBOARD_FILTERS = {
  yearLabel: "Tahun",
  yearAriaLabel: "Pilih tahun observasi",
  searchPlaceholder: "Cari kabupaten/kota…",
  searchAriaLabel: "Cari wilayah untuk menyaring dashboard",
  resultsAriaLabel: "Hasil pencarian wilayah",
  searchEmpty: "Wilayah tidak ditemukan",
  allRegionsLabel: "Semua wilayah",
  clearRegionLabel: "Hapus filter wilayah",
} as const;

/** Selected-region spotlight card copy. */
export const DASHBOARD_SPOTLIGHT = {
  eyebrow: "Wilayah terpilih",
  prevalenceLabel: "Stunting",
  rankLabel: "Peringkat nasional",
  rankUnit: "dari",
  categoryLabel: "Kategori",
  trendLabel: "Tren wilayah ini",
  closeLabel: "Tutup sorotan wilayah",
  noPrevalence: "Data tahun ini belum tersedia untuk wilayah ini.",
} as const;

/** Trend chart copy. */
export const DASHBOARD_TREND = {
  title: "Tren stunting 2021-2024",
  description: "Rata-rata stunting seluruh kabupaten/kota.",
  crossRegionLabel: "Rata-rata wilayah",
  regionLineLabel: "Wilayah terpilih",
  selectRegionHint:
    "Pilih wilayah pada peta untuk membandingkan trennya dengan rata-rata wilayah.",
  targetLabel: "Target 2029",
  whoHighLabel: "Batas tinggi (WHO)",
  whoVeryHighLabel: "Batas sangat tinggi",
  axisYear: "Tahun",
  axisPrevalence: "Stunting (%)",
  errorTitle: "Belum bisa menampilkan tren",
  trendDownLabel: "Menurun sejak {tahun}",
  trendUpLabel: "Naik sejak {tahun}",
  trendFlatLabel: "Stabil sejak {tahun}",
} as const;

/** Trend chart series filter (Semua / Kabupaten / Kota). */
export const DASHBOARD_TREND_FILTER = {
  ariaLabel: "Saring tren menurut tipe wilayah",
  all: "Semua",
  kabupaten: "Kabupaten",
  kota: "Kota",
} as const;

/** Region & province ranking copy. */
export const DASHBOARD_RANKINGS = {
  title: "Wilayah terbaik & terberat",
  description: "Stunting terendah dan tertinggi di tahun terbaru.",
  scopeAriaLabel: "Tampilkan peringkat menurut",
  regionScope: "Kabupaten/Kota",
  provinceScope: "Provinsi",
  bestRegionsTitle: "Stunting terendah",
  worstRegionsTitle: "Stunting tertinggi",
  bestProvincesTitle: "Provinsi terendah",
  worstProvincesTitle: "Provinsi tertinggi",
  rankHeader: "#",
  regionHeader: "Wilayah",
  provinceHeader: "Provinsi",
  prevalenceHeader: "Stunting",
  emptyTitle: "Peringkat belum tersedia",
  emptyDescription: "Data stunting tahun terbaru belum dimuat.",
} as const;

/** Interactive choropleth copy. */
export const DASHBOARD_CHOROPLETH = {
  title: "Peta sebaran stunting",
  description: "Klik sebuah wilayah untuk menyorotnya di seluruh dashboard.",
  openMapLabel: "Buka peta interaktif",
  yearLabel: "Tahun peta",
  selectHint: "Klik wilayah pada peta untuk menyaring.",
  ariaLabel: "Peta sebaran kategori stunting kabupaten/kota",
  noData: "Tidak ada data",
  summaryPrefix: "Dari",
  summaryRegions: "wilayah",
} as const;

/** "How to read the categories" legend copy. */
export const DASHBOARD_LEGEND = {
  title: "Cara membaca kategori",
  description:
    "Tiga kelas warna ini dipakai di seluruh halaman: peta, peringkat, dan simulator.",
} as const;

/** Kota vs Kabupaten high-share copy. */
export const DASHBOARD_TIPE_GAP = {
  title: "Kategori Tinggi per tipe",
  description: "Porsi wilayah dengan stunting ≥ 30% (kategori Tinggi)",
  kabupatenLabel: "Kabupaten",
  kotaLabel: "Kota",
  unitRegion: " wilayah",
  emptyTitle: "Perbandingan belum tersedia",
} as const;

/** Biggest movers leaderboard copy. */
export const DASHBOARD_MOVERS = {
  title: "Perubahan terbesar",
  description: "Wilayah yang paling banyak berubah, 2023-2024.",
  improvedTitle: "Paling membaik",
  worsenedTitle: "Paling memburuk",
  arrow: "→",
  unitPoint: " poin",
  emptyTitle: "Data perubahan belum tersedia",
} as const;

/** Predictor analysis copy (correlation + selection frequency). */
export const DASHBOARD_ANALYSIS = {
  title: "Apa yang paling berhubungan dengan stunting?",
  description: "Keeratan tiap indikator dan seberapa sering model memakainya.",
  correlationTitle: "Keeratan dengan stunting",
  correlationHint:
    "Merah (kanan): menaikkan risiko stunting. Hijau (kiri): menurunkan. Makin panjang barnya, makin erat hubungannya.",
  selectionTitle: "Paling sering dipakai model",
  selectionHint:
    "Persentase wilayah-tahun yang memakai indikator ini saat memprediksi.",
  riskLabel: "Menaikkan risiko",
  protectiveLabel: "Menurunkan risiko",
  errorTitle: "Belum bisa menampilkan analisis indikator",
  emptyTitle: "Data indikator belum lengkap",
  emptyDescription:
    "Statistik indikator belum tersedia. Jalankan kembali impor data dashboard.",
} as const;

/** Model-explanation section copy. */
export const DASHBOARD_MODEL = {
  sectionTitle: "Cara kerja model",
  sectionDescription:
    "Bagaimana prediksi di atas dihitung, seberapa akurat, dan mengapa lebih baik.",
  stepsTitle: "Bagaimana model menebak kelas sebuah wilayah?",
  stepsLead:
    "Empat langkah. Yang khusus: bobot tiap indikator berbeda di tiap wilayah — disesuaikan tetangga geografis dan tahunnya.",
  components: [
    {
      step: 1,
      title: "Setarakan tiap indikator",
      body: "Nilai asli yang satuannya beda-beda (rupiah, persen, tahun) disetarakan dulu supaya bisa dibandingkan dengan adil.",
    },
    {
      step: 2,
      title: "Timbang khusus wilayah ini",
      body: "Tiap indikator dikalikan bobot lokalnya lalu dijumlahkan menjadi satu skor risiko untuk wilayah itu.",
    },
    {
      step: 3,
      title: "Ubah skor jadi peluang",
      body: "Skor diterjemahkan menjadi peluang untuk tiga kelas: Rendah, Sedang, dan Tinggi.",
    },
    {
      step: 4,
      title: "Pilih kelas dengan peluang terbesar",
      body: "Wilayah diberi kelas yang peluangnya paling besar. Itulah prediksi akhirnya.",
    },
  ],
  localNote:
    "Karena bobotnya lokal, simulator di bagian “Coba Prediksinya” menjawab “seandainya indikator wilayah INI berubah”, bukan ramalan untuk sembarang tempat. Indikator yang bobotnya nol ditandai tidak berpengaruh di wilayah itu.",
  equationTitle: "Bentuk teknisnya",
  equationDescription:
    "Untuk penguji: secara formal model ini adalah regresi logistik ordinal terboboti geografis-temporal dengan elastic-net (GTWENOLR).",
  symbols: [
    {
      sym: "expit",
      desc: "Fungsi logistik yang mengubah skor menjadi peluang 0-100%.",
    },
    {
      sym: "αⱼ(sᵢ)",
      desc: "Dua ambang lokal (j = 1, 2) yang memisahkan Rendah | Sedang | Tinggi di wilayah sᵢ.",
    },
    {
      sym: "βₖ(sᵢ)",
      desc: "Bobot indikator ke-k khusus wilayah sᵢ (bisa nol = tidak dipakai).",
    },
    {
      sym: "(tₖ(xᵢₖ)−μₖ)/sₖ",
      desc: "Indikator ke-k yang ditransformasi lalu distandardisasi (sₖ = simpangan baku).",
    },
    {
      sym: "sᵢ",
      desc: "Wilayah/titik fokus lokal; koefisien dihitung ulang untuk tiap wilayah.",
    },
  ],
  performanceTitle: "Seberapa akurat?",
  performanceDescription: "Diuji di luar data pelatihan.",
  performanceEmptyTitle: "Angka performa belum tersedia",
  performanceEmptyDescription:
    "Metrik model belum dimuat. Jalankan kembali impor data dashboard.",
  baselinesTitle: "Dibanding cara yang lebih sederhana",
  baselinesDescription:
    "Akurasi tiap pendekatan pada data uji. Versi adaptif menang.",
  baselinesEmptyTitle: "Perbandingan belum tersedia",
  baselinesEmptyDescription: "Data model pembanding belum dimuat.",
  accuracyLabel: "Akurasi",
  qwkLabel: "QWK",
  highlightModel: "GTWENOLR_adaptif",
  highlightBadge: "Dipakai di sini",
} as const;

/**
 * Full, unabbreviated names for each baseline model in the comparison list,
 * keyed by the raw `name` from `metrics.baselines`. Falls back to the
 * underscore-stripped name when a key is missing.
 */
export const BASELINE_FULL_NAMES: Readonly<Record<string, string>> = {
  OLR: "Ordinal Logistic Regression",
  ENOLR: "Elastic Net Ordinal Logistic Regression",
  GWOLR: "Geographically Weighted Ordinal Logistic Regression",
  GTWOLR: "Geographically and Temporally Weighted Ordinal Logistic Regression",
  GTWENOLR_tetap:
    "Geographically and Temporally Weighted Elastic Net Ordinal Logistic Regression (bandwidth tetap)",
  GTWENOLR_adaptif:
    "Geographically and Temporally Weighted Elastic Net Ordinal Logistic Regression (bandwidth adaptif)",
};

/**
 * "Persamaan Model" content on /prediksi, merged into the prediction card.
 * Part A is the single general equation (server-rendered KaTeX from
 * {@link SIMULATOR_EQUATION.katexGeneral}); Part B is the per-region fitted
 * regression equation, built and rendered with client KaTeX.
 */
export const SIMULATOR_EQUATION = {
  generalTitle: "Bentuk umum",
  /** The single cumulative-logit equation, display-mode LaTeX. */
  katexGeneral:
    "P(Y_i \\le j \\mid s_i) = \\operatorname{expit}\\!\\left( \\alpha_j(s_i) + \\sum_{k=1}^{20} \\beta_k(s_i)\\, \\frac{t_k(x_{ik}) - \\mu_k}{s_k} \\right),\\quad j = 1, 2",
  classProbNote:
    "Peluang tiap kelas = selisih peluang kumulatif: P(Rendah) = P(Y≤1), P(Sedang) = P(Y≤2) − P(Y≤1), P(Tinggi) = 1 − P(Y≤2).",
  symbolsToggle: "Arti simbol",
  localTitle: "Bentuk lokal",
  proportionalOddsNote:
    "Koefisien β identik di kedua baris (proportional odds); hanya intersep α yang berbeda.",
  standardizedNote: "Xₖ adalah nilai indikator yang sudah distandardisasi.",
  nActiveNote: (active: number, total: number): string =>
    `Model memakai ${active} dari ${total} indikator (sisanya berkoefisien 0).`,
} as const;

/** Interactive simulator copy. */
export const DASHBOARD_SIMULATOR = {
  intro:
    "Pilih wilayah dan tahun, geser indikatornya — kelas dan peluangnya langsung dihitung ulang.",
  regionLabel: "Pilih wilayah",
  regionShortLabel: "Wilayah",
  regionPlaceholder: "Pilih wilayah",
  regionSearchPlaceholder: "Cari kabupaten/kota…",
  regionSearchEmpty: "Wilayah tidak ditemukan.",
  yearLabel: "Tahun",
  loadError: "Belum bisa memuat data wilayah ini. Coba lagi sebentar.",
  noFitTitle: "Wilayah-tahun ini belum dimodelkan",
  noFitDescription:
    "Tidak semua wilayah punya data lengkap tiap tahun, jadi sebagian tidak ikut dihitung model. Coba pilih tahun atau wilayah lain.",
  loadingLabel: "Memuat data wilayah.",
  predictedLabel: "Prediksi model",
  actualLabel: "Kenyataan di lapangan",
  probabilitiesLabel: "Seberapa yakin model",
  slidersTitle: "Geser indikator wilayah ini",
  slidersHint:
    "Nilai awal = kondisi asli wilayah. Geser untuk uji “seandainya”.",
  resetLabel: "Kembalikan",
  resetHint: "Kembalikan semua geseran ke nilai asli wilayah.",
  baselineMarkerLabel: "Nilai asli wilayah",
  inactiveBadge: "Tidak dipakai",
  inactiveHint:
    "Di wilayah ini model tidak memakai indikator ini, jadi menggesernya tidak mengubah prediksi.",
  convergedNote: "Hasil model untuk wilayah ini belum sepenuhnya stabil.",
  matchNote: "Sama dengan keluaran resmi model.",
  changedNote: "Nilai diubah.",
  changedFromActual: "berubah",
} as const;

/**
 * Display grouping for the simulator sliders. Maps the model's six dimensions
 * (verbatim from `MODEL_DIMENSIONS`) into the cards shown on screen — the two
 * pangan dimensions are merged into one card. `dimensions` values must match
 * `indicator_dictionary.model_dimension` exactly.
 */
export const SIMULATOR_DIMENSION_GROUPS: readonly {
  readonly title: string;
  readonly dimensions: readonly string[];
  /** Which column the card sits in (explicit, so order is deterministic). */
  readonly column: "left" | "right";
  /** Wider inter-slider spacing to balance the two columns' total height. */
  readonly roomy?: boolean;
}[] = [
  { title: "Sosial-Ekonomi", dimensions: ["Sosial-Ekonomi"], column: "left" },
  { title: "Pendidikan", dimensions: ["Pendidikan"], column: "left" },
  { title: "Gender", dimensions: ["Gender"], column: "left" },
  {
    title: "Kesehatan",
    dimensions: ["Kesehatan"],
    column: "right",
    roomy: true,
  },
  {
    title: "Konsumsi dan Ketahanan Pangan",
    dimensions: ["Konsumsi Pangan", "Ketahanan Pangan"],
    column: "right",
    roomy: true,
  },
];

/** Route-segment error boundary copy. */
export const DASHBOARD_ERROR = {
  title: "Tidak bisa memuat dashboard",
  description:
    "Terjadi kesalahan saat memuat data stunting. Coba muat ulang halaman; jika masih gagal, periksa koneksi Anda.",
  retryLabel: "Coba lagi",
  loadingLabel: "Memuat dashboard stunting.",
} as const;

/** Footer data-source citation. */
export const DASHBOARD_FOOTER = {
  sourcesLabel: "Sumber data",
  sources:
    "Prevalensi stunting: SSGI/SKI Kemenkes. Indikator sosial-ekonomi, pendidikan, kesehatan, pangan, dan gender: BPS RI.",
  modelLabel: "Model",
  model:
    "GTWENOLR bandwidth adaptif, 514 kabupaten/kota, 2021-2024. Hasil riset skripsi.",
} as const;

/**
 * Ordered metric mapping. The model-performance tiles read each key from
 * `model_metadata.metrics` and render the tile when the value is numeric.
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
    description:
      "Kesepakatan terbobot — menghukum loncatan kategori lebih berat.",
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

/** How many entries the data-insight rankings show. */
export const DASHBOARD_INSIGHTS = {
  rankingLimit: 10,
  provinceLimit: 5,
  moverLimit: 5,
} as const;
