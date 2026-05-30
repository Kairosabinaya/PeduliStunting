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
  eyebrow: "Data, model & simulasi",
  title: "Mengenal stunting di Indonesia",
  description:
    "Lihat sebaran stunting di 514 kabupaten/kota, pahami cara model memperkirakannya, lalu coba sendiri: ubah indikator sebuah wilayah dan saksikan perkiraannya berubah.",
} as const;

/** Short tab title + friendly intro for each of the three dashboard sections. */
export const DASHBOARD_SECTIONS = {
  insight: {
    eyebrow: "Bagian 1",
    title: "Potret Stunting",
    description:
      "Lihat di mana stunting paling tinggi, bagaimana trennya sejak 2021, dan indikator apa yang paling berhubungan dengannya.",
  },
  model: {
    eyebrow: "Bagian 2",
    title: "Cara Kerja Model",
    description:
      "Bagaimana model memperkirakan tingkat stunting sebuah wilayah, seberapa akurat, dan mengapa lebih baik daripada cara yang lebih sederhana.",
  },
  simulator: {
    eyebrow: "Bagian 3",
    title: "Coba Prediksinya",
    description:
      "Pilih satu wilayah, lalu ubah indikatornya dan lihat langsung bagaimana perkiraan tingkat stuntingnya berubah.",
  },
} as const;

/** Headline KPI tiles for the insight section. */
export const DASHBOARD_KPI = {
  errorTitle: "Belum bisa menampilkan ringkasan",
  emptyTitle: "Data wilayah belum tersedia",
  emptyDescription:
    "Data indikator wilayah belum dimuat. Jalankan kembali impor data dashboard.",
  meanLabel: "Rata-rata stunting",
  meanHint: "Rata-rata seluruh kabupaten/kota (tiap wilayah dihitung setara).",
  changeLabel: "Dibanding tahun lalu",
  highCountLabel: "Wilayah berisiko tinggi",
  highCountHint: "Stunting 30% ke atas — kategori “sangat tinggi” menurut WHO.",
  targetLabel: "Jarak ke target nasional",
  targetHint: "Target pemerintah (RPJMN) 2029: 14,2%.",
  unitPercent: "%",
  unitPoint: " poin",
} as const;

/** Trend chart copy. */
export const DASHBOARD_TREND = {
  title: "Tren stunting 2021-2024",
  description:
    "Garis biru tegas = rata-rata wilayah pada dashboard ini. Garis putus-putus = angka nasional resmi (dihitung berdasarkan jumlah penduduk). Keduanya wajar berbeda karena cara menghitungnya berbeda — bukan karena salah satu keliru.",
  crossRegionLabel: "Rata-rata wilayah",
  nationalLabel: "Angka nasional",
  targetLabel: "Target 2029",
  whoHighLabel: "Batas tinggi (WHO)",
  whoVeryHighLabel: "Batas sangat tinggi",
  axisYear: "Tahun",
  axisPrevalence: "Stunting (%)",
  errorTitle: "Belum bisa menampilkan tren",
} as const;

/** Region & province ranking copy. */
export const DASHBOARD_RANKINGS = {
  title: "Wilayah terbaik & terberat",
  description:
    "Sepuluh kabupaten/kota dengan stunting terendah dan tertinggi di tahun terbaru, beserta provinsi terbaik dan terberat.",
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

/** Choropleth (build-time SVG) copy. */
export const DASHBOARD_CHOROPLETH = {
  title: "Peta sebaran stunting",
  description:
    "Tiap wilayah diwarnai sesuai tingkat stuntingnya. Untuk menjelajah lebih jauh — zoom, klik wilayah, bandingkan antar tahun — buka peta interaktif.",
  openMapLabel: "Buka peta interaktif",
  yearLabel: "Tahun peta",
} as const;

/** Predictor analysis copy (correlation + selection frequency). */
export const DASHBOARD_ANALYSIS = {
  title: "Apa yang paling berhubungan dengan stunting?",
  description:
    "Dua cara melihat ke-20 indikator: seberapa erat hubungannya dengan angka stunting, dan seberapa sering model benar-benar memakainya untuk memprediksi.",
  correlationTitle: "Keeratan dengan stunting",
  correlationHint:
    "Ke kanan (merah): makin tinggi indikator, makin tinggi stunting. Ke kiri (hijau): makin tinggi indikator, makin rendah stunting. Makin panjang batangnya, makin erat hubungannya.",
  selectionTitle: "Paling sering dipakai model",
  selectionHint:
    "Persentase wilayah-tahun yang benar-benar memakai indikator ini saat memprediksi. Makin tinggi, makin sering indikator ini menentukan hasil.",
  riskLabel: "Menaikkan risiko",
  protectiveLabel: "Menurunkan risiko",
  errorTitle: "Belum bisa menampilkan analisis indikator",
  emptyTitle: "Data indikator belum lengkap",
  emptyDescription:
    "Statistik indikator belum tersedia. Jalankan kembali impor data dashboard.",
} as const;

/** Model-explanation section copy. */
export const DASHBOARD_MODEL = {
  stepsTitle: "Bagaimana model menebak kelas sebuah wilayah?",
  stepsLead:
    "Empat langkah sederhana. Yang membuat model ini khusus: bobot tiap indikator BERBEDA di setiap wilayah — disesuaikan dengan tetangga geografis dan tahunnya. Jadi rumusnya bersifat lokal, bukan satu rumus untuk seluruh Indonesia.",
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
      sym: "skor (η)",
      desc: "Jumlah seluruh indikator setelah ditimbang untuk wilayah ini.",
    },
    {
      sym: "α₁, α₂",
      desc: "Dua garis batas yang memisahkan Rendah | Sedang | Tinggi.",
    },
    {
      sym: "βₖ",
      desc: "Bobot indikator ke-k khusus wilayah ini (bisa nol = tidak dipakai).",
    },
    { sym: "σ", desc: "Fungsi yang mengubah skor menjadi peluang 0-100%." },
  ],
  performanceTitle: "Seberapa akurat?",
  performanceDescription:
    "Diuji pada data yang tidak dipakai saat melatih model, jadi angkanya jujur.",
  performanceEmptyTitle: "Angka performa belum tersedia",
  performanceEmptyDescription:
    "Metrik model belum dimuat. Jalankan kembali impor data dashboard.",
  baselinesTitle: "Dibanding cara yang lebih sederhana",
  baselinesDescription:
    "Akurasi tiap pendekatan pada data uji. Versi adaptif (yang dipakai di sini) menang karena bobotnya menyesuaikan tiap wilayah. Arahkan kursor untuk detail.",
  baselinesEmptyTitle: "Perbandingan belum tersedia",
  baselinesEmptyDescription: "Data model pembanding belum dimuat.",
  accuracyLabel: "Akurasi",
  qwkLabel: "QWK",
  highlightModel: "GTWENOLR_adaptif",
  highlightBadge: "Dipakai di sini",
} as const;

/** Interactive simulator copy. */
export const DASHBOARD_SIMULATOR = {
  intro:
    "Pilih sebuah kabupaten/kota dan tahun, lalu geser indikatornya. Kelas stunting dan peluangnya langsung dihitung ulang khusus untuk wilayah itu.",
  regionLabel: "Pilih wilayah",
  regionPlaceholder: "Pilih wilayah",
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
    "Nilai awal = kondisi asli wilayah. Geser untuk bertanya “seandainya indikator ini berubah, kelasnya jadi apa?”",
  resetLabel: "Kembalikan ke kondisi asli",
  resetHint: "Kembalikan semua geseran ke nilai asli wilayah.",
  inactiveBadge: "Tidak berpengaruh di sini",
  inactiveHint:
    "Di wilayah ini model tidak memakai indikator ini, jadi menggesernya tidak mengubah prediksi.",
  convergedNote:
    "Catatan teknis: proses penghitungan model untuk wilayah ini belum sepenuhnya stabil, tetapi prediksinya tetap sama dengan yang dilaporkan model.",
  matchNote:
    "Pada nilai asli wilayah, prediksi di sini sama dengan keluaran resmi model.",
  changedNote: "Nilai sudah diubah dari kondisi asli wilayah.",
  changedFromActual: "(berbeda dari kenyataan)",
} as const;

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
} as const;
