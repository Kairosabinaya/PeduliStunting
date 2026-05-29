/**
 * Copy strings + structured content for the landing-before-login experience
 * rendered at `/map` for unauthenticated users. Kept in one config module
 * (project guidelines §0) so PRs that tweak wording can be reviewed without touching
 * component code. All copy is in Bahasa Indonesia per project locale rules.
 */

export const LANDING_HERO_COPY = {
  eyebrow: "Peta Sebaran Stunting Indonesia",
  headline: "Lihat kondisi stunting di setiap kabupaten.",
  description:
    "Visualisasi sebaran berdasarkan data resmi BPS untuk 514 kabupaten/kota — dari Aceh hingga Papua. Geser, perbesar, dan temukan wilayah anda.",
  primaryCta: "Mulai jelajahi",
  secondaryCta: "Daftar gratis",
} as const;

export const LANDING_STAKES_GLANCE_COPY = {
  eyebrow: "Skala masalah",
  headline: "Stunting bukan hanya angka.",
  paragraph:
    "Setiap titik di peta adalah ribuan anak yang pertumbuhannya tertinggal pada 1.000 hari pertama kehidupan — waktu yang tidak bisa diulang.",
  stats: [
    {
      value: 22.6,
      suffix: "%",
      label: "Rata-rata prevalensi nasional",
      caption: "Indonesia 2024 — Survei Kesehatan Indonesia",
    },
    {
      value: 514,
      label: "Kabupaten/kota terpetakan",
      caption: "Seluruh wilayah administratif Indonesia",
    },
    {
      value: 1000,
      label: "Hari pertama yang menentukan",
      caption: "Periode emas tumbuh kembang anak",
    },
  ],
} as const;

export const LANDING_WHY_CARE_COPY = {
  eyebrow: "Mengapa peta ini penting",
  headline: "Data resmi, dapat diaktifkan.",
  pillars: [
    {
      title: "Data BPS terverifikasi",
      description:
        "Bersumber dari Survei Kesehatan Indonesia dan publikasi resmi BPS — bukan estimasi atau pihak ketiga.",
    },
    {
      title: "Prediksi berbasis model GTWENOLR",
      description:
        "Geographically and Temporally Weighted Elastic Net Ordinal Logistic Regression — model spasial-temporal yang dikembangkan khusus untuk konteks Indonesia.",
    },
    {
      title: "Per kabupaten, lintas tahun",
      description:
        "Bandingkan kondisi 2021 hingga 2024 di tingkat kabupaten. Pahami arah perubahan, bukan sekadar potret sesaat.",
    },
  ],
} as const;

export const LANDING_FINAL_CTA_COPY = {
  eyebrow: "Mulai dari wilayah anda",
  question: "Bagaimana kondisi stunting di kabupaten anda?",
  description:
    "Daftar gratis untuk mengakses peta interaktif penuh, melihat detail per wilayah, dan memanfaatkan tracker tumbuh kembang anak.",
  daftarLabel: "Daftar gratis",
  loginLabel: "Sudah punya akun? Masuk",
} as const;
