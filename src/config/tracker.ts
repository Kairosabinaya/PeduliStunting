import type { Sex } from "@/domain/tracking/value-objects/sex";
import type { SdClass } from "@/domain/tracking/value-objects/sd-classification";
import type { GrowthIndicator } from "@/domain/tracking/value-objects/growth-indicator";
import type { ChildImmunizationStatus } from "@/domain/health-plan/entities/child-immunization";
import type { ChildMilestoneStatus } from "@/domain/health-plan/entities/child-milestone";
import type { MilestoneDomain } from "@/domain/health-plan/entities/milestone";

import { LANDING_ROUTE } from "@/config/app";

/* ─────────────────────────── routes ─────────────────────────── */

export const TRACKER_ROUTE = "/tracker";
export const TRACKER_NEW_CHILD_ROUTE = "/tracker/anak/baru";

export const TRACKER_DASHBOARD_SECTIONS = {
  growth: "pertumbuhan",
  immunization: "imunisasi",
  development: "perkembangan",
} as const;

export type TrackerDashboardSection =
  (typeof TRACKER_DASHBOARD_SECTIONS)[keyof typeof TRACKER_DASHBOARD_SECTIONS];

export function trackerChildRoute(childId: string): string {
  return trackerSelectChildRoute(childId);
}

export function trackerChildEditRoute(childId: string): string {
  return `${trackerSelectChildRoute(childId)}&modal=edit`;
}

/** Tracker dashboard URL focused on a specific child via the `?anak=` param. */
export function trackerSelectChildRoute(childId: string): string {
  return `${TRACKER_ROUTE}?anak=${childId}`;
}

export function trackerChildDashboardSectionRoute(
  childId: string,
  section: TrackerDashboardSection,
): string {
  return `${trackerSelectChildRoute(childId)}#${section}`;
}

export function trackerChildMeasurementsRoute(childId: string): string {
  return trackerChildDashboardSectionRoute(
    childId,
    TRACKER_DASHBOARD_SECTIONS.growth,
  );
}

export function trackerChildAddMeasurementRoute(childId: string): string {
  return trackerChildDashboardSectionRoute(
    childId,
    TRACKER_DASHBOARD_SECTIONS.growth,
  );
}

export function trackerChildImmunizationsRoute(childId: string): string {
  return trackerChildDashboardSectionRoute(
    childId,
    TRACKER_DASHBOARD_SECTIONS.immunization,
  );
}

export function trackerChildMilestonesRoute(childId: string): string {
  return trackerChildDashboardSectionRoute(
    childId,
    TRACKER_DASHBOARD_SECTIONS.development,
  );
}

/* ─────────────────────────── copy ─────────────────────────── */

export const TRACKER_LIST_COPY = {
  metaTitle: "Tracker",
  eyebrow: "Tracker anak",
  title: "Dashboard tumbuh kembang anak",
  description:
    "Lihat status pertumbuhan, tren, imunisasi, dan perkembangan anak dalam bahasa yang mudah dipahami.",
  addCta: "Tambah anak",
  errorTitle: "Tidak bisa memuat data anak",
  errorDescriptionFallback:
    "Terjadi kesalahan saat mengambil data. Coba muat ulang halaman.",
  errorRetry: "Coba lagi",
  emptyTitle: "Belum ada anak terdaftar",
  emptyDescription:
    "Tambahkan profil anak untuk mulai memantau berat, tinggi, lingkar kepala, dan imunisasi.",
  switcherAriaLabel: "Pilih anak",
} as const;

export const TRACKER_FIELD_LIMITS = {
  childNameMaxLength: 80,
  noteMaxLength: 500,
  dashboardImmunizationPreviewCount: 4,
  birthWeightKg: { min: 0.5, max: 10, step: "0.01" },
  birthLengthCm: { min: 20, max: 80, step: "0.1" },
  gestationalAgeWeeks: { min: 20, max: 36, step: "1" },
  measurementWeightKg: { min: 0.5, max: 60, step: "0.01" },
  measurementHeightCm: { min: 30, max: 140, step: "0.1" },
  measurementHeadCircumferenceCm: { min: 20, max: 70, step: "0.1" },
  measurementMuacCm: { min: 5, max: 40, step: "0.1" },
  quickScreeningAgeMonths: { min: 0, max: 60, step: "1" },
  quickScreeningWeightKg: { min: 0.1, max: 50, step: "0.1" },
  quickScreeningHeightCm: { min: 1, max: 150, step: "0.1" },
} as const;

export const TRACKER_VALIDATION_COPY = {
  summaryTitle: "Ada isian yang perlu diperbaiki",
  summaryDescription: "Periksa kolom yang ditandai merah, lalu simpan kembali.",
  required: "Kolom ini wajib diisi.",
  invalidDate: "Tanggal tidak valid.",
  futureDate: "Tanggal tidak boleh di masa depan.",
  birthDateFuture: "Tanggal lahir tidak boleh di masa depan.",
  measurementBeforeBirth:
    "Tanggal pengukuran tidak boleh lebih awal dari tanggal lahir.",
  immunizationBeforeBirth:
    "Tanggal imunisasi tidak boleh lebih awal dari tanggal lahir.",
  milestoneBeforeBirth:
    "Tanggal cek perkembangan tidak boleh lebih awal dari tanggal lahir.",
  integer: "Isi dengan angka bulat, tanpa koma atau desimal.",
  number: "Isi dengan angka yang benar. Gunakan titik atau koma untuk desimal.",
  malformedNumber: "Format angka tidak valid. Contoh yang benar: 8.5 atau 8,5.",
  atLeastOneMeasurement:
    "Isi minimal satu pengukuran: berat, tinggi/panjang, lingkar kepala, atau LiLA.",
  rangeFormat: (label: string, min: number, max: number, unit: string) =>
    `${label} harus antara ${min} dan ${max} ${unit}.`,
  maxLengthFormat: (label: string, max: number) =>
    `${label} maksimal ${max} karakter.`,
} as const;

export const TRACKER_DASHBOARD_COPY = {
  statusSectionId: TRACKER_DASHBOARD_SECTIONS.growth,
  immunizationSectionId: TRACKER_DASHBOARD_SECTIONS.immunization,
  developmentSectionId: TRACKER_DASHBOARD_SECTIONS.development,
  status: {
    title: "Status anak hari ini",
    description:
      "Status ini adalah skrining dari data pengukuran terakhir, bukan diagnosis medis.",
    emptyTitle: "Belum ada pengukuran",
    emptyDescription:
      "Tambahkan berat dan tinggi/panjang anak untuk mulai melihat status pertumbuhan.",
    titleNormal: "Pertumbuhan dalam rentang normal",
    titleWatch: "Ada indikator yang perlu dipantau",
    titleUrgent: "Ada indikator yang perlu segera dikonsultasikan",
    addMeasurement: "Tambah pengukuran",
    lastMeasuredAt: (date: string) => `Pengukuran terakhir: ${date}`,
    ageFormat: (ageMonths: number) => `${ageMonths} bulan`,
    noValue: "Belum ada data",
    source:
      "Mengacu pada WHO Child Growth Standards dan standar antropometri nasional.",
  },
  growth: {
    title: "Tren pertumbuhan",
    description:
      "Pantau arah grafik dari waktu ke waktu. Pilih indikator untuk melihat tren yang berbeda.",
    addCardTitle: "Tambah pengukuran",
    addCardDescription:
      "Catat pengukuran terbaru agar status skrining tetap akurat.",
    addMeasurementAnchorId: "tambah-pengukuran",
    historyTitle: "Riwayat pengukuran",
  },
  immunization: {
    title: "Imunisasi",
    description:
      "Lihat imunisasi yang sudah waktunya, akan datang, dan yang perlu dikejar.",
    dueTitle: "Sudah waktunya",
    upcomingTitle: "Akan datang",
    missedTitle: "Perlu dikejar",
    emptyDue: "Tidak ada imunisasi yang perlu diberikan hari ini.",
    emptyUpcoming: "Belum ada jadwal imunisasi berikutnya.",
    emptyMissed: "Tidak ada imunisasi yang terlewat.",
    noSchedule: "Tanpa jadwal",
    ageFormat: (months: number) => `${months} bulan`,
  },
  development: {
    title: "Perkembangan",
    description:
      "Cek kemampuan anak sesuai rentang usianya. Bila ada yang belum tercapai, konsultasikan ke posyandu atau Puskesmas.",
  },
  fields: {
    age: "Usia",
    measurement: "Pengukuran",
    zScore: "z-score",
    status: "Status",
    nutritionStatus: "Status Gizi",
  },
  units: {
    month: "bulan",
    kilogram: "kg",
    centimeter: "cm",
  },
  risk: {
    normal: "Normal",
    watch: "Perlu pantau",
    urgent: "Perlu konsultasi",
    empty: "Belum ada data",
  },
} as const;

export const ADD_CHILD_COPY = {
  metaTitle: "Tambah anak — Tracker",
  eyebrow: "Tracker",
  title: "Tambah profil anak",
  description:
    "Isi data dasar anak. Anda bisa melengkapi pengukuran dan imunisasi setelah profil dibuat.",
  cancel: "Batal",
  submit: "Simpan profil anak",
  identitySectionTitle: "Identitas anak",
  birthSectionTitle: "Kondisi kelahiran",
  birthSectionHint: "Opsional. Lengkapi bila Anda mengingatnya.",
  birthStatus: {
    legend: "Apakah anak lahir prematur?",
    term: "Cukup bulan",
    preterm: "Prematur",
    termNote:
      "Anak lahir cukup bulan (37 minggu atau lebih). Tidak perlu mengisi usia kehamilan.",
  },
  fields: {
    nameLabel: "Nama anak",
    namePlaceholder: "mis. Aira",
    sexLabel: "Jenis kelamin",
    sexOptionMale: "Laki-laki",
    sexOptionFemale: "Perempuan",
    birthDateLabel: "Tanggal lahir",
    birthWeightLabel: "Berat lahir (kg)",
    birthLengthLabel: "Panjang lahir (cm)",
    gestationalAgeLabel: "Usia kehamilan saat lahir (minggu)",
    gestationalAgeHint:
      "Diisi untuk bayi prematur. Cukup bulan biasanya 37-42 minggu.",
    notesLabel: "Catatan",
    notesHint: "Opsional. Maksimal 500 karakter.",
  },
  genericError:
    "Tidak bisa menyimpan profil anak. Coba lagi atau muat ulang halaman.",
} as const;

export const EDIT_CHILD_COPY = {
  metaTitle: "Edit anak — Tracker",
  eyebrow: "Tracker",
  title: "Edit profil anak",
  description:
    "Perbaiki data anak bila ada yang salah input. Perubahan langsung tersimpan ke profil.",
  submit: "Simpan perubahan",
  cancel: "Batal",
  notFoundTitle: "Anak tidak ditemukan",
  notFoundDescription:
    "Profil anak yang ingin diedit tidak ada atau bukan milik akun ini.",
  invalidId: "Anak tidak valid. Muat ulang halaman lalu coba lagi.",
  genericError:
    "Tidak bisa menyimpan perubahan. Coba lagi atau muat ulang halaman.",
} as const;

export const CHILD_DETAIL_COPY = {
  metaTitleSuffix: "Tracker",
  backToList: "Semua anak",
  editLabel: "Edit data",
  editAriaLabel: (name: string) => `Edit data anak ${name}`,
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
    "Status pertumbuhan anak Anda saat ini berdasarkan pengukuran terakhir.",
  chartCardTitle: "Grafik pertumbuhan anak",
  chartCardDescription:
    "Lihat tren grafik pertumbuhan anak Anda dari waktu ke waktu.",
  chartIndicatorLabel: "Indikator",
  chartEmptyTitle: "Kurva belum tersedia",
  chartEmpty: "Tambahkan pengukuran untuk melihat kurva.",
  chartAgeAxisLabel: "Usia (bulan)",
  chartUpperNormalBoundary: "Batas Normal Atas",
  chartLowerNormalBoundary: "Batas Normal Bawah",
  chartStuntingBoundary: "Ambang Stunting",
  chartWhoMedian: "Rata-rata WHO",
  chartAriaLabel: (indicator: string) =>
    `Kurva ${indicator} terhadap usia (bulan)`,
  chartDotAriaLabel: (date: string, _z: string) =>
    `Pengukuran ${date}. Aktifkan untuk melihat detail.`,
} as const;

export const DELETE_CHILD_COPY = {
  trigger: "Hapus anak",
  triggerAriaLabel: (name: string) => `Hapus data anak ${name}`,
  title: "Hapus data anak?",
  description:
    "Profil anak beserta seluruh riwayatnya akan dihapus dari akun Anda.",
  confirmBody: (name: string) =>
    `Data ${name} — termasuk pengukuran, imunisasi, dan perkembangan — tidak akan tampil lagi di akun ini. Tindakan ini tidak dapat dibatalkan dari aplikasi.`,
  cancel: "Batal",
  confirm: "Ya, hapus",
  pending: "Menghapus...",
  invalidId: "ID anak tidak valid.",
  genericError:
    "Tidak bisa menghapus data anak. Coba lagi atau muat ulang halaman.",
} as const;

export const MEASUREMENTS_COPY = {
  metaTitleSuffix: "Pengukuran — Tracker",
  eyebrow: "Tracker",
  titlePrefix: "Pengukuran",
  description:
    "Catat berat, tinggi/panjang, lingkar kepala, dan LiLA. Status gizi akan dievaluasi secara otomatis.",
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
    heightLabel: "Tinggi badan (cm)",
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

export const GROWTH_INDICATOR_PARENT_LABEL: Record<GrowthIndicator, string> = {
  BB_U: "Berat badan sesuai usia",
  TB_U: "Tinggi badan sesuai usia",
  BB_TB: "Berat badan sesuai tinggi",
  LK_U: "Lingkar kepala sesuai usia",
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

export const SD_CLASS_PARENT_GUIDANCE: Record<SdClass, string> = {
  normal: "Pertumbuhan anak sesuai standar WHO. Terus pantau setiap bulan.",
  pendek:
    "Konsultasikan ke posyandu/Puskesmas. Perhatikan asupan protein hewani.",
  sangat_pendek: "Segera bawa ke Puskesmas untuk pemeriksaan SDIDTK.",
  kurang:
    "Konsultasikan ke posyandu. Tingkatkan asupan kalori dan protein anak.",
  buruk: "Segera bawa ke Puskesmas untuk penanganan gizi buruk.",
  lebih:
    "Pertumbuhan melebihi rata-rata. Pantau pola makan agar tidak obesitas.",
  obesitas:
    "Konsultasikan ke ahli gizi/dokter untuk mengatur pola makan dan aktivitas.",
  tinggi:
    "Anak tumbuh tinggi dengan baik. Pastikan asupan gizinya tetap seimbang.",
  kurus: "Konsultasikan ke posyandu. Tingkatkan frekuensi dan variasi MPASI.",
  sangat_kurus:
    "Segera bawa ke Puskesmas untuk pemeriksaan kesehatan menyeluruh.",
  gemuk:
    "Pertumbuhan mulai berlebih. Perbanyak aktivitas fisik dan kurangi gula.",
  mikrosefali:
    "Ukuran kepala lebih kecil dari standar. Segera konsultasikan ke dokter anak.",
  makrosefali:
    "Ukuran kepala lebih besar dari standar. Segera konsultasikan ke dokter anak.",
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

/* ─────────────────────────── gizi (Phase 5) ─────────────────────────── */

export const NUTRITION_ROUTE_SLUG = "gizi";

export function trackerChildNutritionRoute(childId: string): string {
  return `/tracker/anak/${childId}/gizi`;
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
  ctaHref: LANDING_ROUTE,
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
  saveNoteCta: "Simpan",
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
  countFormat: (done: number, total: number) => `dari ${total}`,
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
  ctaHref: LANDING_ROUTE,
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
  savedMessage: "Status imunisasi tersimpan.",
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
    description: "Tren grafik naik ke arah yang lebih baik.",
    tone: "success" as const,
  },
  stable: {
    label: "Stabil",
    description: "Pertumbuhan stabil sesuai jalurnya.",
    tone: "primary" as const,
  },
  monitor: {
    label: "Perlu pantau",
    description: "Tren grafik menurun, perhatikan asupan gizi.",
    tone: "warning" as const,
  },
} as const;

/* ─────────────────────────── status hero copy ─────────────────────────── */

export const STATUS_HERO_COPY = {
  titleNormal: "Semua dalam jalur normal",
  titleWarning: "Beberapa hal perlu perhatian",
  titleDanger: "Perlu segera konsultasi",
  addMeasurementCta: "Tambah pengukuran",
  viewDetailsCta: "Lihat detail",
  quickStatsFormat: (ageMonths: number, weight: string, height: string) =>
    `Usia ${ageMonths} bulan • BB: ${weight} • TB: ${height}`,
  emptyMeasurements: "Belum ada pengukuran",
  lastMeasurementFormat: (date: string) => `Diukur tanggal ${date}`,
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
    description: "Jadwal vaksinasi sesuai Buku KIA.",
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
