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
  navOverview: "Ringkasan",
  navMeasurements: "Pengukuran",
  navImmunizations: "Imunisasi",
  navMilestones: "Perkembangan",
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
  genericError: "Tidak bisa menyimpan pengukuran. Periksa input lalu coba lagi.",
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

export const IMMUNIZATION_STATUS_LABEL: Record<ChildImmunizationStatus, string> =
  {
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
