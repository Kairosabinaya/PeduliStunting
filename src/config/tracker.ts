import type { Sex } from "@/domain/tracking/value-objects/sex";
import type { SdClass } from "@/domain/tracking/value-objects/sd-classification";
import type { GrowthIndicator } from "@/domain/tracking/value-objects/growth-indicator";
import type { ChildImmunizationStatus } from "@/domain/health-plan/entities/child-immunization";
import type { ChildMilestoneStatus } from "@/domain/health-plan/entities/child-milestone";
import type { MilestoneDomain } from "@/domain/health-plan/entities/milestone";

/* ─────────────────────────── routes ─────────────────────────── */

export const TRACKER_ROUTE = "/tracker";
export const TRACKER_NEW_CHILD_ROUTE = "/tracker/anak/baru";

export function trackerChildRoute(childId: string): string {
  return `/tracker/anak/${childId}`;
}

export function trackerChildMeasurementsRoute(childId: string): string {
  return `/tracker/anak/${childId}/pengukuran`;
}

export function trackerChildImmunizationsRoute(childId: string): string {
  return `/tracker/anak/${childId}/imunisasi`;
}

export function trackerChildMilestonesRoute(childId: string): string {
  return `/tracker/anak/${childId}/perkembangan`;
}

/* ─────────────────────────── copy ─────────────────────────── */

export const TRACKER_LIST_COPY = {
  metaTitle: "Tracker",
  eyebrow: "Pertumbuhan & rencana sehat",
  title: "Tracker anak",
  description:
    "Pantau pertumbuhan, imunisasi, dan milestone setiap anak yang terdaftar dalam akun ini.",
  addCta: "Tambah anak",
  errorTitle: "Tidak bisa memuat data anak",
  errorDescriptionFallback:
    "Terjadi kesalahan saat mengambil data. Coba muat ulang halaman.",
  emptyTitle: "Belum ada anak terdaftar",
  emptyDescription:
    "Tambahkan profil anak untuk mulai memantau berat, tinggi, lingkar kepala, dan imunisasi.",
} as const;

export const ADD_CHILD_COPY = {
  metaTitle: "Tambah anak — Tracker",
  eyebrow: "Tracker",
  title: "Tambah profil anak",
  description:
    "Isi data dasar anak. Anda bisa melengkapi pengukuran dan imunisasi setelah profil dibuat.",
  cancel: "Batal",
  submit: "Simpan profil anak",
  fields: {
    nameLabel: "Nama anak",
    namePlaceholder: "mis. Aira",
    sexLabel: "Jenis kelamin",
    sexOptionMale: "Laki-laki",
    sexOptionFemale: "Perempuan",
    birthDateLabel: "Tanggal lahir",
    birthWeightLabel: "Berat lahir (kg)",
    birthLengthLabel: "Panjang lahir (cm)",
    gestationalAgeLabel: "Usia kehamilan (minggu)",
    notesLabel: "Catatan",
    notesHint: "Opsional. Maksimal 500 karakter.",
  },
  genericError:
    "Tidak bisa menyimpan profil anak. Coba lagi atau muat ulang halaman.",
} as const;

export const CHILD_DETAIL_COPY = {
  metaTitleSuffix: "Tracker",
  backToList: "Semua anak",
  navOverview: "Ringkasan",
  navMeasurements: "Pengukuran",
  navImmunizations: "Imunisasi",
  navMilestones: "Perkembangan",
  navNutrition: "Gizi",
  ageLabel: "Usia",
  ageUnitMonth: "bulan",
  birthDateLabel: "Tanggal lahir",
  sexLabel: "Jenis kelamin",
  lastMeasurementLabel: "Pengukuran terakhir",
  noMeasurementYet: "Belum ada pengukuran",
  notFoundTitle: "Anak tidak ditemukan",
  notFoundDescription:
    "Profil anak yang Anda cari tidak ada atau bukan milik akun ini.",
  notFoundCta: "Kembali ke daftar anak",
  summaryCardTitle: "Ringkasan pertumbuhan",
  summaryCardDescription:
    "Pengukuran terakhir per indikator beserta klasifikasi Standar Deviasi (SD) Buku KIA.",
  chartCardTitle: "Kurva pertumbuhan vs standar WHO",
  chartCardDescription:
    "Bandingkan z-score anak Anda dengan rentang acuan WHO ±2 SD dan ±3 SD.",
  chartIndicatorLabel: "Indikator",
  chartEmpty:
    "Belum ada pengukuran. Tambahkan setidaknya satu pengukuran untuk melihat kurva.",
} as const;

export const MEASUREMENTS_COPY = {
  metaTitleSuffix: "Pengukuran — Tracker",
  eyebrow: "Tracker",
  titlePrefix: "Pengukuran",
  description:
    "Catat berat, tinggi/panjang, lingkar kepala, dan LiLA. Z-score akan dihitung otomatis dari standar WHO.",
  addCardTitle: "Tambah pengukuran",
  addCardDescription:
    "Minimal satu kolom pengukuran harus diisi. Tanggal mengikuti zona waktu lokal Anda.",
  historyTitle: "Riwayat pengukuran",
  historyDescription: "Diurutkan dari yang paling baru.",
  emptyTitle: "Belum ada pengukuran",
  emptyDescription:
    "Tambahkan pengukuran pertama untuk mulai melihat tren pertumbuhan anak.",
  errorTitle: "Tidak bisa memuat riwayat",
  fields: {
    measuredAtLabel: "Tanggal pengukuran",
    weightLabel: "Berat badan (kg)",
    heightLabel: "Tinggi/Panjang badan (cm)",
    measuredLyingLabel: "Posisi pengukuran",
    measuredLyingStanding: "Berdiri",
    measuredLyingLying: "Berbaring",
    headCircumferenceLabel: "Lingkar kepala (cm)",
    muacLabel: "LiLA (cm)",
    noteLabel: "Catatan",
    noteHint: "Opsional. Maksimal 500 karakter.",
  },
  submit: "Simpan pengukuran",
  submitting: "Menyimpan...",
  successMessage: "Pengukuran berhasil disimpan.",
  genericError:
    "Tidak bisa menyimpan pengukuran. Periksa input lalu coba lagi.",
} as const;

export const IMMUNIZATION_COPY = {
  metaTitleSuffix: "Imunisasi — Tracker",
  eyebrow: "Tracker",
  titlePrefix: "Imunisasi",
  description:
    "Ceklis status imunisasi sesuai jadwal Kementerian Kesehatan. Tanggal pemberian opsional.",
  cardTitle: "Daftar imunisasi",
  cardDescription:
    "Status disimpan otomatis. Ubah status atau isi tanggal pemberian.",
  emptyTitle: "Jadwal imunisasi belum tersedia",
  emptyDescription:
    "Jadwal imunisasi dimuat dari katalog publik. Hubungi admin jika daftar kosong.",
  errorTitle: "Tidak bisa memuat imunisasi",
  recommendedAgeLabel: "Rekomendasi usia",
  recommendedAgeUnit: "bulan",
  doseLabel: "Dosis",
  statusLabel: "Status",
  givenAtLabel: "Tanggal diberikan",
  noteLabel: "Catatan",
  saving: "Menyimpan...",
  saved: "Tersimpan",
  errorSave: "Gagal menyimpan",
} as const;

export const MILESTONE_COPY = {
  metaTitleSuffix: "Perkembangan — Tracker",
  eyebrow: "Tracker",
  titlePrefix: "Perkembangan",
  description:
    "Ceklis kemampuan anak per domain dan rentang usia (SDIDTK). Tandai 'tercapai' atau 'terlambat'.",
  cardTitle: "Daftar milestone",
  cardDescription: "Status disimpan otomatis saat diubah.",
  emptyTitle: "Belum ada milestone",
  emptyDescription:
    "Katalog milestone dimuat dari sumber publik. Hubungi admin jika daftar kosong.",
  errorTitle: "Tidak bisa memuat milestone",
  ageRangeLabel: "Rentang usia",
  ageRangeUnit: "bulan",
  statusLabel: "Status",
  checkedAtLabel: "Tanggal dicek",
  noteLabel: "Catatan",
  saving: "Menyimpan...",
  saved: "Tersimpan",
  errorSave: "Gagal menyimpan",
} as const;

/* ─────────────────────────── labels ─────────────────────────── */

export const SEX_LABEL: Record<Sex, string> = {
  L: "Laki-laki",
  P: "Perempuan",
};

export const GROWTH_INDICATOR_LABEL: Record<GrowthIndicator, string> = {
  BB_U: "Berat Badan menurut Usia",
  TB_U: "Tinggi Badan menurut Usia",
  BB_TB: "Berat Badan menurut Tinggi Badan",
  LK_U: "Lingkar Kepala menurut Usia",
};

export const GROWTH_INDICATOR_SHORT: Record<GrowthIndicator, string> = {
  BB_U: "BB/U",
  TB_U: "TB/U",
  BB_TB: "BB/TB",
  LK_U: "LK/U",
};

export interface SdClassDisplay {
  readonly label: string;
  readonly tone: "primary" | "neutral" | "success" | "warning" | "danger";
}

export const SD_CLASS_DISPLAY: Record<SdClass, SdClassDisplay> = {
  buruk: { label: "Sangat kurang", tone: "danger" },
  kurang: { label: "Kurang", tone: "warning" },
  normal: { label: "Normal", tone: "success" },
  lebih: { label: "Lebih", tone: "warning" },
  obesitas: { label: "Obesitas", tone: "danger" },
  pendek: { label: "Pendek (stunting)", tone: "warning" },
  sangat_pendek: { label: "Sangat pendek (stunting)", tone: "danger" },
  tinggi: { label: "Tinggi", tone: "primary" },
  kurus: { label: "Kurus (wasting)", tone: "warning" },
  sangat_kurus: { label: "Sangat kurus (wasting)", tone: "danger" },
  gemuk: { label: "Gemuk", tone: "warning" },
  mikrosefali: { label: "Mikrosefali", tone: "danger" },
  makrosefali: { label: "Makrosefali", tone: "warning" },
};

export const IMMUNIZATION_STATUS_LABEL: Record<
  ChildImmunizationStatus,
  string
> = {
  pending: "Belum diberikan",
  done: "Sudah diberikan",
  skipped: "Dilewati",
};

export const MILESTONE_STATUS_LABEL: Record<ChildMilestoneStatus, string> = {
  not_checked: "Belum dicek",
  achieved: "Tercapai",
  delayed: "Terlambat",
};

export const MILESTONE_DOMAIN_LABEL: Record<MilestoneDomain, string> = {
  gross_motor: "Motorik kasar",
  fine_motor: "Motorik halus",
  language: "Bahasa",
  social: "Sosial & kemandirian",
};

/* ─────────────────────────── kehamilan (Phase 6) ─────────────────────────── */

export const PREGNANCY_ROUTE = "/tracker/kehamilan";

export const PREGNANCY_PAGE_COPY = {
  metaTitle: "Kehamilan — Tracker",
  eyebrow: "Tracker",
  title: "Catatan kehamilan",
  description:
    "Pantau usia kehamilan, kunjungan ANC, konsumsi Tablet Tambah Darah, dan kenaikan berat badan ibu.",
  errorTitle: "Tidak bisa memuat catatan kehamilan",
  emptyTitle: "Belum ada catatan kehamilan",
  emptyDescription:
    "Isi tanggal HPHT dan data dasar untuk mulai memantau usia kehamilan dan rencana ANC.",
  tabs: {
    profile: "Profil",
    anc: "ANC",
    ttd: "TTD harian",
    weight: "Berat",
    fetal: "Janin",
  },
  saving: "Menyimpan...",
  cancel: "Batal",
} as const;

export const PREGNANCY_PROFILE_COPY = {
  hpht: "HPHT (Hari Pertama Haid Terakhir)",
  expectedDue: "Perkiraan tanggal lahir",
  initialWeightKg: "Berat awal sebelum hamil (kg)",
  heightCm: "Tinggi badan ibu (cm)",
  notes: "Catatan",
  notesHint: "Opsional, maksimal 1000 karakter.",
  saveCta: "Simpan profil kehamilan",
  gestationalLabel: "Usia kehamilan",
  gestationalFormat: (weeks: number, days: number) =>
    `${weeks} minggu ${days} hari`,
  trimesterFormat: (trimester: 1 | 2 | 3) => `Trimester ${trimester}`,
  daysToDueFormat: (days: number) =>
    days >= 0
      ? `${days} hari menuju perkiraan lahir`
      : `${-days} hari lewat perkiraan lahir`,
  archiveCta: "Arsipkan kehamilan ini",
  archiveConfirm:
    "Mengarsipkan kehamilan akan menghentikan pemantauan aktif. Riwayat tetap tersimpan. Lanjutkan?",
} as const;

export const PREGNANCY_ANC_COPY = {
  title: "Kunjungan ANC",
  description:
    "Target minimal 6 kunjungan ANC menurut Buku KIA 2024. Salah satunya oleh dokter dengan USG.",
  progressFormat: (done: number, total: number) =>
    `${done} dari ${total} kunjungan tercatat`,
  markCta: "Catat kunjungan ini",
  removeCta: "Reset",
  byDoctorLabel: "Oleh dokter",
  hasUsgLabel: "Dengan USG",
  visitNumberFormat: (n: number) => `Kunjungan ${n}`,
  weekRangeFormat: (min: number, max: number) => `Rentang minggu ${min}-${max}`,
  recommendedDoctorLabel: "Rekomendasi: dokter + USG",
  saving: "Menyimpan...",
} as const;

export const PREGNANCY_TTD_COPY = {
  title: "Tablet Tambah Darah (TTD)",
  description:
    "TTD harian mencegah anemia ibu yang berkaitan dengan BBLR dan stunting.",
  markTodayCta: "Catat dosis hari ini",
  saving: "Menyimpan...",
  monthlyProgressFormat: (n: number) => `${n} dosis bulan ini`,
  lastDoseFormat: (date: string) => `Dosis terakhir: ${date}`,
  noDoseLabel: "Belum ada catatan dosis.",
  historyHeading: "Riwayat dosis",
} as const;

export const PREGNANCY_WEIGHT_COPY = {
  title: "Kenaikan berat badan",
  description:
    "Rekomendasi total kenaikan berat selama kehamilan tergantung IMT pra-hamil ibu.",
  addWeightCta: "Catat berat hari ini",
  saving: "Menyimpan...",
  inputLabel: "Berat saat ini (kg)",
  noEntries: "Belum ada catatan berat.",
  recommendationFormat: (min: number, max: number) =>
    `Target kenaikan total: ${min}-${max} kg`,
  currentGainFormat: (kg: number) =>
    `Kenaikan saat ini: ${kg >= 0 ? "+" : ""}${kg.toFixed(1)} kg`,
  missingInitial:
    "Isi berat awal dan tinggi ibu di tab Profil untuk melihat target kenaikan.",
  historyHeading: "Riwayat berat",
} as const;

export const PREGNANCY_FETAL_COPY = {
  title: "Perkembangan janin",
  description:
    "Ukuran janin berdasarkan minggu kehamilan — sekadar mental anchor.",
  noMilestone:
    "Belum ada milestone untuk minggu ini. Coba lihat tab Profil dan pastikan HPHT terisi benar.",
  weekRangeFormat: (from: number, to: number) => `Minggu ${from}-${to}`,
} as const;

/* ─────────────────────────── gizi (Phase 5) ─────────────────────────── */

export const NUTRITION_ROUTE_SLUG = "gizi";

export function trackerChildNutritionRoute(childId: string): string {
  return `/tracker/anak/${childId}/${NUTRITION_ROUTE_SLUG}`;
}

export const NUTRITION_PAGE_COPY = {
  metaTitleSuffix: "Gizi — Tracker",
  eyebrow: "Tracker",
  title: "Catatan gizi anak",
  description:
    "Lacak praktik gizi protektif: ASI eksklusif, MPASI, Vitamin A, dan obat cacing.",
  errorTitle: "Tidak bisa memuat catatan gizi",
  tabs: {
    asi: "ASI eksklusif",
    mpasi: "MPASI",
    vitA: "Vitamin A",
    cacing: "Obat cacing",
  },
} as const;

export const NUTRITION_ASI_COPY = {
  title: "ASI eksklusif (0-6 bulan)",
  description:
    "ASI saja tanpa makanan atau minuman lain hingga usia 6 bulan, lalu dilanjutkan hingga 2 tahun bersama MPASI.",
  question: "Apakah anak saat ini mendapat ASI eksklusif?",
  optionYes: "Ya",
  optionNo: "Tidak",
  currentStatusYes: "Tercatat ASI eksklusif sejak",
  currentStatusNo: "Tercatat TIDAK eksklusif sejak",
  notRecorded: "Belum dicatat.",
  saving: "Menyimpan...",
  educationHeading: "Mengapa ASI eksklusif penting?",
  educationBody:
    "ASI eksklusif menyediakan nutrisi lengkap, antibodi pelindung, dan ikatan emosional. Setiap hari ASI mengurangi risiko stunting akibat infeksi berulang.",
  progressLabelFormat: (days: number, target: number) =>
    `${days} dari ${target} hari ASI eksklusif`,
  outOfAgeMessage:
    "Anak sudah lebih dari 6 bulan. Rekap status ASI eksklusif tetap dapat dicatat untuk referensi.",
} as const;

export const NUTRITION_MPASI_COPY = {
  title: "MPASI",
  description:
    "MPASI ideal dimulai tepat usia 6 bulan dengan variasi 8 grup makanan dan tekstur yang sesuai usia.",
  startedAtQuestion: "Tanggal mulai MPASI",
  startedAtSavedFormat: (date: string) => `MPASI tercatat mulai ${date}.`,
  startedAtNotYet: "Belum dicatat.",
  saveCta: "Simpan tanggal MPASI",
  saving: "Menyimpan...",
  foodGroupsHeading: "8 grup makanan",
  foodGroupsSubtitle:
    "Prioritaskan protein hewani (telur, ikan, ayam, daging, hati).",
  textureHeading: "Panduan tekstur & porsi",
  textureSubtitle:
    "Sesuaikan tekstur agar anak belajar mengunyah dan menelan dengan aman.",
  emphasisBadge: "Prioritas",
  outOfAgeMessage:
    "MPASI ideal mulai usia 6 bulan. Anak Anda masih di bawah usia tersebut — fokus ke ASI eksklusif dulu.",
} as const;

export const NUTRITION_VITAMIN_A_COPY = {
  title: "Vitamin A",
  description:
    "Vitamin A diberikan kapsul biru sekali (6-11 bulan) lalu kapsul merah Februari & Agustus (12-59 bulan).",
  alreadyGivenFormat: (date: string) => `Tercatat diberikan pada ${date}.`,
  notYetGiven: "Belum dicatat.",
  recordCta: "Catat pemberian hari ini",
  saving: "Menyimpan...",
  resetCta: "Reset catatan",
  ineligibleMessage: "Belum sesuai rentang usia anak.",
  educationHeading: "Mengapa Vitamin A penting?",
  educationBody:
    "Vitamin A mendukung kekebalan tubuh dan kesehatan mata. Dosis sesuai jadwal Kemenkes mengurangi risiko infeksi yang dapat menghambat pertumbuhan.",
} as const;

export const NUTRITION_DEWORMING_COPY = {
  title: "Obat cacing",
  description:
    "Anak usia 1-6 tahun perlu obat cacing 2x setahun untuk mengurangi infeksi cacing yang mengganggu penyerapan gizi.",
  thisYearLabel: "Pemberian tahun ini",
  historyHeading: "Riwayat pemberian",
  recordCta: "Catat dosis hari ini",
  saving: "Menyimpan...",
  noRecords: "Belum ada catatan.",
  ineligibleMessage:
    "Obat cacing direkomendasikan untuk anak usia 1-6 tahun. Anak Anda belum mencapai usia tersebut.",
  outOfAgeMessage:
    "Anak sudah di luar rentang 1-6 tahun. Catatan sebelumnya tetap ditampilkan.",
  progressFormat: (done: number, target: number) =>
    `${done} dari ${target} dosis tahun ini`,
} as const;

/* ─────────────────────────── milestone ─────────────────────────── */

/**
 * Icon Lucide name per domain perkembangan. Komponen presentasi memetakan
 * nama ke import dynamic supaya bundle tetap kecil.
 */
export const MILESTONE_DOMAIN_ICON: Record<MilestoneDomain, string> = {
  gross_motor: "PersonStanding",
  fine_motor: "Brush",
  language: "MessageCircle",
  social: "HeartHandshake",
};

export const MILESTONE_ALERT_COPY = {
  title: "Beberapa milestone belum tercapai",
  bodyFormat: (delayed: number) =>
    `${delayed} tonggak perkembangan ditandai terlambat. Sesuai panduan Buku KIA, konsultasikan ke posyandu atau Puskesmas untuk pemeriksaan SDIDTK lebih lanjut.`,
  ctaLabel: "Pelajari panduan SDIDTK",
  ctaHref: "/edukasi",
} as const;

export const MILESTONE_RANGE_FILTER_COPY = {
  legend: "Tampilkan",
  optionCurrent: "Rentang usia anak",
  optionAll: "Semua rentang",
  ariaLabel: "Mode tampilan rentang milestone",
  summaryFormat: (childAgeMonths: number) =>
    `Anak berusia ${childAgeMonths} bulan saat ini.`,
} as const;

export const MILESTONE_CARD_COPY = {
  achievedCta: "Tercapai",
  delayedCta: "Belum tercapai",
  resetCta: "Reset",
  saving: "Menyimpan...",
  expandNote: "Catatan & tanggal",
  collapseNote: "Tutup catatan",
  emptyStimulation:
    "Panduan stimulasi untuk rentang usia ini belum tersedia. Konsultasikan ke posyandu atau Puskesmas.",
  stimulationHeading: "Coba aktivitas ini",
  ageRangeFormat: (min: number, max: number) => `${min}–${max} bulan`,
} as const;

/* ─────────────────────────── imunisasi timeline ─────────────────────────── */

export const IMMUNIZATION_CELL_COPY = {
  done: { label: "Selesai", tone: "success" as const },
  upcoming: { label: "Akan datang", tone: "primary" as const },
  missed: { label: "Terlewat", tone: "warning" as const },
  future: { label: "Belum waktunya", tone: "neutral" as const },
  skipped: { label: "Dilewati", tone: "neutral" as const },
} as const;

export const IMMUNIZATION_PROGRESS_COPY = {
  title: "Progres imunisasi",
  ariaLabelFormat: (done: number, total: number) =>
    `${done} dari ${total} vaksin tercatat selesai`,
  caption: "Berdasarkan usia anak dan jadwal Buku KIA 2024.",
  legendDone: "Selesai",
  legendUpcoming: "Akan datang dalam ~30 hari",
  legendMissed: "Terlewat lebih dari sebulan",
  legendFuture: "Belum waktunya",
  legendSkipped: "Dilewati (alasan medis)",
} as const;

export const IMMUNIZATION_EDUCATION_COPY = {
  title: "Mengapa imunisasi lengkap penting?",
  body: "Imunisasi tidak lengkap berkaitan dengan risiko stunting yang lebih tinggi karena infeksi berulang dapat mengganggu penyerapan gizi. Tetap ikuti jadwal posyandu — keterlambatan beberapa minggu masih dapat dikejar.",
  ctaLabel: "Pelajari lebih lanjut tentang stunting",
  ctaHref: "/edukasi",
  sourceLabel: "Buku KIA 2024",
} as const;

export const IMMUNIZATION_TIMELINE_COPY = {
  title: "Timeline imunisasi",
  description:
    "Geser ke samping di layar kecil. Ketuk satu kotak untuk lihat detail dan tandai sudah diberikan.",
  ageColumnLabel: (months: number) => `${months} bulan`,
  emptyTitle: "Belum ada jadwal imunisasi",
  emptyDescription:
    "Katalog imunisasi belum di-seed. Hubungi admin atau jalankan migration seed jadwal imunisasi.",
} as const;

export const IMMUNIZATION_DETAIL_COPY = {
  doseLabel: "Dosis",
  ageLabel: "Rekomendasi usia",
  ageUnit: "bulan",
  statusHeading: "Status saat ini",
  preventsHeading: "Vaksin ini mencegah",
  preventsFallback:
    "Penjelasan penyakit yang dicegah belum tersedia untuk vaksin ini.",
  notesHeading: "Catatan jadwal",
  notesFallback: "Tidak ada catatan tambahan dari jadwal nasional.",
  givenAtLabel: "Tanggal diberikan",
  ownNoteLabel: "Catatan Anda",
  markDoneCta: "Tandai sudah diberikan",
  markPendingCta: "Tandai belum",
  markSkippedCta: "Tandai dilewati",
  saving: "Menyimpan...",
  closeLabel: "Tutup detail",
} as const;

/* ─────────────────────────── tren pertumbuhan ─────────────────────────── */

export const TREND_COPY = {
  notEnough: {
    label: "Belum cukup data",
    description: "Butuh minimal dua pengukuran dengan indikator yang sama.",
    tone: "neutral" as const,
  },
  improving: {
    label: "Membaik",
    description: "Z-score naik dibanding pengukuran sebelumnya.",
    tone: "success" as const,
  },
  stable: {
    label: "Stabil",
    description: "Z-score relatif sama dengan pengukuran sebelumnya.",
    tone: "primary" as const,
  },
  monitor: {
    label: "Perlu pantau",
    description: "Z-score menurun dibanding pengukuran sebelumnya.",
    tone: "warning" as const,
  },
} as const;

/* ─────────────────────────── fun-size copy ─────────────────────────── */

export const FUN_SIZE_COPY = {
  title: "Sekilas perbandingan",
  description:
    "Sekadar bayangan supaya angka pengukuran lebih mudah dikira-kira di rumah.",
  weightFormat: (kg: number, label: string) =>
    `Berat ${kg.toFixed(1)} kg ${label}.`,
  heightFormat: (cm: number, label: string) =>
    `Tinggi ${cm.toFixed(1)} cm ${label}.`,
  emptyState: "Tambah pengukuran untuk melihat perbandingan ini.",
} as const;

/* ─────────────────────────── detail sheet copy ─────────────────────────── */

export const GROWTH_DETAIL_COPY = {
  title: "Detail pengukuran",
  dateLabel: "Tanggal pengukuran",
  ageLabel: "Usia saat pengukuran",
  ageUnit: "bulan",
  indicatorsHeading: "Indikator",
  weightLabel: "Berat",
  heightLabel: "Tinggi/Panjang",
  headCircumferenceLabel: "Lingkar kepala",
  muacLabel: "LiLA",
  notesLabel: "Catatan",
  noNotes: "Tidak ada catatan.",
  close: "Tutup",
} as const;

/* ─────────────────────────── module card copy ─────────────────────────── */

/**
 * Copy untuk Module Card dashboard `/tracker/anak/[childId]`. Setiap modul
 * adalah pintu masuk ke sub-route detail; status line di kartu adalah
 * ringkasan satu-baris.
 */
export const MODULE_CARD_COPY = {
  growth: {
    title: "Pertumbuhan",
    description: "Status terkini menurut standar WHO.",
    cta: "Lihat detail pengukuran",
    emptyStatus: "Belum ada pengukuran.",
  },
  immunization: {
    title: "Imunisasi",
    description: "Progress vaksinasi sesuai jadwal Buku KIA.",
    cta: "Buka jadwal imunisasi",
    emptyStatus: "Belum ada catatan imunisasi.",
    statusFormat: (done: number, total: number) =>
      `${done} dari ${total} vaksin tercatat.`,
  },
  milestone: {
    title: "Perkembangan",
    description: "Tonggak SDIDTK menurut Buku KIA.",
    cta: "Buka ceklis perkembangan",
    emptyStatus: "Belum ada ceklis tercatat.",
    statusFormat: (achieved: number, total: number) =>
      `${achieved} dari ${total} tonggak tercapai.`,
  },
  nutrition: {
    title: "Gizi",
    description: "ASI, MPASI, Vitamin A, dan obat cacing.",
    cta: "Buka catatan gizi",
    emptyStatus: "Belum ada catatan gizi.",
    statusFormat: (count: number) => `${count} catatan tercatat`,
  },
} as const;
