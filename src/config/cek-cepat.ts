import type { SdClass } from "@/domain/tracking/value-objects/sd-classification";

/**
 * Single source of truth for the "Cek Cepat" floating banner copy and
 * mappings. The banner is a client-only widget mounted under `/tracker/**`
 * via `tracker/layout.tsx` (see Phase 1 plan).
 *
 * Engine kalkulator dipanggil via Route Handler POST `/api/tracker/cek-cepat`.
 * Result diserialisasi sebagai `QuickScreeningResultDto` (lihat
 * `src/application/tracking/use-cases/compute-quick-screening.ts`).
 */

export const CEK_CEPAT_ENDPOINT = "/api/tracker/cek-cepat";

export const CEK_CEPAT_STORAGE_KEY = "peduli-stunting:cek-cepat-v2";

export const CEK_CEPAT_COPY = {
  fabLabel: "Cek Cepat",
  fabTooltip: "Buka kalkulator skrining cepat",
  fabAriaLabel: "Buka kalkulator Cek Cepat",
  collapseAriaLabel: "Tutup kalkulator Cek Cepat",
  panelTitle: "Cek Cepat",
  panelSubtitle:
    "Skrining instan status pertumbuhan anak berdasarkan standar WHO.",
  panelTagline: "Edukatif. Bukan diagnosis.",
  introBody:
    "Isi data anak Anda di bawah. Hasil hanya bersifat indikatif — selalu konsultasikan ke posyandu atau tenaga kesehatan.",
  fieldLabels: {
    sex: "Jenis kelamin",
    sexMale: "Laki-laki",
    sexFemale: "Perempuan",
    inputMode: "Cara isi usia",
    inputModeBirthDate: "Tanggal lahir",
    inputModeAgeMonths: "Usia (bulan)",
    birthDate: "Tanggal lahir",
    ageMonths: "Usia (bulan)",
    weightKg: "Berat badan (kg)",
    heightCm: "Tinggi badan (cm)",
  },
  fieldPlaceholders: {
    weightKg: "mis. 9.5",
    heightCm: "mis. 75",
    ageMonths: "mis. 12",
  },
  fieldHints: {
    inputMode:
      "Pilih cara mengisi usia: dari tanggal lahir atau usia bulan langsung.",
    ageRange: "Dukungan usia 0 - 60 bulan.",
    height:
      "Gunakan tinggi badan berdiri atau panjang badan berbaring sesuai usia anak.",
  },
  buttons: {
    submit: "Hitung skrining",
    submitting: "Menghitung...",
    reset: "Reset",
    minimize: "Minimkan",
    createChild: "Buat profil anak untuk pantau berkelanjutan",
    learnMore: "Pelajari lebih lanjut tentang stunting",
  },
  validation: {
    weightRequiredOrHeight:
      "Minimal salah satu dari berat atau tinggi badan harus diisi.",
    weightInvalid: "Angka lebih dari 0 dan tidak lebih dari 50 kg.",
    heightInvalid: "Angka lebih dari 0 dan tidak lebih dari 150 cm.",
    ageInvalid: "Usia harus antara 0 dan 60 bulan.",
    birthDateInvalid: "Tanggal lahir tidak valid.",
    birthDateFuture: "Tanggal lahir tidak boleh di masa depan.",
  },
  result: {
    headline: "Hasil skrining",
    stuntingLabel: "Tinggi/Panjang Badan menurut Umur (TB/U)",
    stuntingFallback: "Tidak cukup data untuk hitung status stunting.",
    supportingLabel: "Indikator pendukung",
    missingStandardsTitle: "Data WHO belum tersedia",
    missingStandardsBody:
      "Beberapa indikator tidak dapat dihitung karena tabel standar WHO belum diisi. Hubungi admin atau lihat dokumentasi `docs/source/who-standards/` untuk mengisinya.",
    disclaimerTitle: "Disclaimer",
    disclaimerBody:
      "Hasil ini hanya bersifat skrining edukatif, bukan diagnosis medis. Konsultasikan ke posyandu, puskesmas, atau dokter anak untuk pemeriksaan menyeluruh.",
  },
  errors: {
    serverGeneric: "Tidak bisa menghitung skrining. Coba beberapa saat lagi.",
    serverNetwork: "Tidak terhubung. Periksa koneksi internet Anda.",
  },
} as const;

/**
 * Tone token mirrors the project Badge tone for visual consistency. The
 * mapping is intentionally simple — UI components choose their own
 * background / border by reading `tone` rather than receiving a raw color.
 */
export type CekCepatTone =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "primary";

export interface CekCepatStatusCopy {
  readonly label: string;
  readonly tone: CekCepatTone;
  readonly interpretation: string;
}

/**
 * Mapping `SdClass -> friendly copy` SPECIFIC to the Cek Cepat banner. We keep
 * a separate map from `SD_CLASS_DISPLAY` (in `src/config/tracker.ts`) because
 * the banner uses a shorter, more conversational tone aimed at first-time
 * visitors, while `SD_CLASS_DISPLAY` is for the in-tracker history view.
 */
export const CEK_CEPAT_STATUS_COPY: Readonly<
  Record<SdClass, CekCepatStatusCopy>
> = {
  buruk: {
    label: "Berat badan sangat kurang",
    tone: "danger",
    interpretation:
      "Berat badan jauh di bawah standar WHO. Segera periksa ke posyandu atau puskesmas.",
  },
  kurang: {
    label: "Berat badan kurang",
    tone: "warning",
    interpretation:
      "Berat badan di bawah standar. Pantau lebih ketat dan konsultasikan ke posyandu.",
  },
  normal: {
    label: "Normal",
    tone: "success",
    interpretation: "Berada dalam rentang normal menurut standar WHO.",
  },
  lebih: {
    label: "Risiko berat lebih",
    tone: "warning",
    interpretation:
      "Cenderung di atas rentang ideal. Perhatikan pola gizi seimbang.",
  },
  obesitas: {
    label: "Obesitas",
    tone: "danger",
    interpretation:
      "Berat jauh di atas rentang ideal. Konsultasikan ke dokter anak.",
  },
  pendek: {
    label: "Pendek (stunting)",
    tone: "warning",
    interpretation:
      "Tinggi/panjang badan di bawah standar usia. Indikasi stunting — konsultasikan ke posyandu.",
  },
  sangat_pendek: {
    label: "Sangat pendek (stunting berat)",
    tone: "danger",
    interpretation:
      "Tinggi/panjang badan jauh di bawah standar. Indikasi stunting berat — segera periksa.",
  },
  tinggi: {
    label: "Tinggi",
    tone: "primary",
    interpretation: "Tinggi di atas rentang standar usia. Tetap pantau gizi.",
  },
  kurus: {
    label: "Kurus (wasting)",
    tone: "warning",
    interpretation:
      "Berat tidak sebanding tinggi. Indikasi wasting — pantau pola makan.",
  },
  sangat_kurus: {
    label: "Sangat kurus (wasting berat)",
    tone: "danger",
    interpretation:
      "Berat jauh kurang dibanding tinggi. Indikasi wasting berat — periksa segera.",
  },
  gemuk: {
    label: "Berisiko gizi lebih",
    tone: "warning",
    interpretation:
      "Berat cenderung lebih dari ideal. Perhatikan keseimbangan asupan.",
  },
  mikrosefali: {
    label: "Mikrosefali",
    tone: "danger",
    interpretation: "Lingkar kepala di bawah standar. Konsultasikan ke dokter.",
  },
  makrosefali: {
    label: "Makrosefali",
    tone: "danger",
    interpretation: "Lingkar kepala di atas standar. Konsultasikan ke dokter.",
  },
};

export const CEK_CEPAT_INDICATOR_SHORT: Readonly<
  Record<"BB_U" | "TB_U" | "BB_TB" | "LK_U", string>
> = {
  BB_U: "BB/U",
  TB_U: "TB/U",
  BB_TB: "BB/TB",
  LK_U: "LK/U",
};

/**
 * Maximum age (months) supported by the calculator. WHO Child Growth
 * Standards cover 0-60 months; older children use the WHO Growth Reference
 * tables which are out of scope for v1.
 */
export const CEK_CEPAT_MAX_AGE_MONTHS = 60;
