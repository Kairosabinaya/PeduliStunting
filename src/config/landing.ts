/**
 * Marketing copy and brand assets shown on the public landing page. Centralised
 * so the page itself contains zero hardcoded strings or paths — every piece of
 * customer-facing content is editable from this file alone, satisfying
 * project guidelines §2.2 (configuration lives in `/src/config/`).
 *
 * Per STATE.md §5.1 the landing page is `static` with no DB fetch; the source
 * of truth for what the visitor sees is therefore this file plus the brand
 * assets in `/public/brand/`.
 */

import { APP_NAME } from "./app";

export interface LandingCta {
  readonly href: string;
  readonly label: string;
}

export interface LandingBrandLogo {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

export interface LandingHero {
  readonly kicker: string;
  readonly title: string;
  readonly description: string;
  readonly primaryCta: LandingCta;
  readonly secondaryCta: LandingCta;
}

export type LandingPillarKey = "map" | "edukasi" | "tracker" | "dashboard";
export type LandingPillarTone = "primary" | "primary-soft" | "accent";

export interface LandingPillar {
  readonly key: LandingPillarKey;
  readonly title: string;
  readonly description: string;
  readonly bullets: readonly string[];
  readonly tone: LandingPillarTone;
}

export interface LandingModelSnapshot {
  readonly heading: string;
  readonly name: string;
  readonly description: string;
  readonly facts: readonly {
    readonly label: string;
    readonly value: string;
    readonly emphasis?: "neutral" | "primary" | "accent";
  }[];
}

export interface LandingSectionHeader {
  readonly title: string;
  readonly description: string;
}

export interface LandingTrustPoint {
  readonly title: string;
  readonly description: string;
}

export interface LandingCtaBanner {
  readonly title: string;
  readonly description: string;
  readonly cta: LandingCta;
}

export interface LandingFooter {
  readonly tagline: string;
  readonly note: string;
  readonly locale: string;
}

/**
 * Horizontal wordmark used in the landing header. Both themes are committed so
 * the file can swap variants without an additional fetch when the user toggles
 * the theme — the inactive variant is collapsed via Tailwind `dark:` utilities.
 */
export const LANDING_LOGO: Readonly<Record<"light" | "dark", LandingBrandLogo>> = {
  light: {
    src: "/brand/logo-horizontal-color.png",
    width: 480,
    height: 120,
    alt: APP_NAME,
  },
  dark: {
    src: "/brand/logo-horizontal-white.png",
    width: 480,
    height: 120,
    alt: APP_NAME,
  },
};

export const LANDING_HERO: LandingHero = {
  kicker: "Data resmi BPS, Susenas, dan Kemenkes RI",
  title: `${APP_NAME} menyatukan peta, edukasi, dan pemantauan pertumbuhan anak Indonesia.`,
  description:
    "Empat alat dalam satu aplikasi: peta prevalensi nasional, ringkasan Buku KIA 2024, tracker pertumbuhan pribadi, dan dashboard model GTWENOLR. Gratis untuk keluarga, kader posyandu, dan peneliti.",
  primaryCta: { href: "/auth/sign-up", label: "Daftar gratis" },
  secondaryCta: { href: "/auth/sign-in", label: "Saya sudah punya akun" },
};

export const LANDING_MODEL_SNAPSHOT: LandingModelSnapshot = {
  heading: "Ringkasan model",
  name: "GTWENOLR",
  description:
    "Geographically and Temporally Weighted Elastic-Net Ordinal Logistic Regression — adaptif per kabupaten/kota dan tahun.",
  facts: [
    { label: "Periode", value: "2021-2024" },
    { label: "Kabupaten/kota", value: "514" },
    { label: "Prediktor", value: "20 indikator", emphasis: "accent" },
    {
      label: "Kategori",
      value: "Rendah - Sedang - Tinggi",
      emphasis: "primary",
    },
  ],
};

export const LANDING_PILLARS_HEADER: LandingSectionHeader = {
  title: "Empat alat, satu tujuan",
  description:
    "Setiap fitur dirancang berurutan: dari memahami sebaran, mempelajari penyebabnya, memantau anak Anda, hingga menelaah model di baliknya.",
};

export const LANDING_PILLARS: readonly LandingPillar[] = [
  {
    key: "map",
    title: "Peta nasional",
    description:
      "Choropleth kabupaten/kota 2021-2024 dengan klasifikasi Rendah, Sedang, Tinggi dan toggle hasil prediksi model.",
    bullets: [
      "514 kabupaten/kota dengan koordinat resmi BPS",
      "Filter per tahun dan indikator pendukung X1-X20",
      "Penjelasan kategori sesuai Permenkes",
    ],
    tone: "primary",
  },
  {
    key: "edukasi",
    title: "Edukasi Buku KIA",
    description:
      "Ringkasan modul resmi Buku Kesehatan Ibu dan Anak 2024 dikelompokkan per topik dan rentang usia anak.",
    bullets: [
      "Topik gizi, imunisasi, perkembangan, kehamilan",
      "Bahasa lugas, nyaman dibaca di ponsel",
      "Setiap artikel mencantumkan halaman sumber",
    ],
    tone: "accent",
  },
  {
    key: "tracker",
    title: "Tracker pertumbuhan",
    description:
      "Catat berat, tinggi, lingkar kepala, LiLA, imunisasi, dan milestone perkembangan dengan z-score otomatis standar WHO.",
    bullets: [
      "Z-score dan klasifikasi sesuai Buku KIA 2024",
      "Ceklis imunisasi dan SDIDTK per anak",
      "Data milik akun Anda, bisa dihapus kapan saja",
    ],
    tone: "primary-soft",
  },
  {
    key: "dashboard",
    title: "Dashboard model",
    description:
      "Penjelasan model GTWENOLR — bandwidth adaptif, hyperparameter, metrik akurasi, dan slider what-if untuk eksplorasi prediktor.",
    bullets: [
      "Hyperparameter dan metrik publikasi",
      "Profil indikator X1 hingga X20",
      "Slider what-if untuk simulasi perubahan",
    ],
    tone: "primary",
  },
];

export const LANDING_TRUST_HEADER: LandingSectionHeader = {
  title: "Mengapa Peduli Stunting",
  description:
    "Dibangun di atas data resmi, dirancang untuk privasi keluarga, dan diuji untuk ponsel mid-range di jaringan lambat.",
};

export const LANDING_TRUST_POINTS: readonly LandingTrustPoint[] = [
  {
    title: "Sumber resmi",
    description:
      "Indikator BPS, Susenas, dan Kemenkes RI. Standar WHO LMS untuk perhitungan z-score.",
  },
  {
    title: "Privasi data anak",
    description:
      "Data pertumbuhan hanya bisa diakses akun pemilik dan bisa dihapus seketika dari halaman Akun.",
  },
  {
    title: "Ramah ponsel",
    description:
      "Dirancang ringan untuk Android mid-range dan jaringan lambat — tetap responsif di Slow 3G.",
  },
];

export const LANDING_CTA_BANNER: LandingCtaBanner = {
  title: "Siap mulai memantau pertumbuhan anak?",
  description:
    "Akun gratis tanpa kartu kredit. Anda bisa keluar atau menghapus data kapan pun.",
  cta: { href: "/auth/sign-up", label: "Buat akun" },
};

export const LANDING_FOOTER: LandingFooter = {
  tagline: "Tugas akhir riset kesehatan masyarakat",
  note: "Indonesia",
  locale: "Bahasa Indonesia",
};
