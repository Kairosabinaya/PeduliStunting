/**
 * User-facing copy for the AI panel and the deterministic recommended-question
 * templates per page. Kept out of components so all strings are reviewable in
 * one place. All copy is Bahasa Indonesia.
 */

import type { AiPageId } from "./ai";

/** Panel chrome + state copy. */
export const AI_COPY = {
  launcherOpen: "Tanya AI",
  launcherAriaLabel: "Buka asisten AI",
  title: "Asisten Stunting",
  subtitle: "Tanya tentang data & tumbuh-kembang",
  placeholder: "Tanya tentang stunting...",
  sendLabel: "Kirim",
  stopLabel: "Hentikan",
  newSessionLabel: "Baru",
  closeLabel: "Tutup",
  previousMessages: "pesan sebelumnya",
  collapseLabel: "Lipat",
  recommendedHeading: "Apa yang ingin kamu ketahui?",
  thinking: "Sedang menyiapkan jawaban...",
  emptyTitle: "Mulai bertanya",
  emptyDescription:
    "Tanyakan tentang prevalensi stunting, perbandingan wilayah, prediksi model, atau kondisi tumbuh-kembang anak.",
  disclaimer: "AI dapat membuat kesalahan.",
  errorTitle: "Gagal memuat jawaban",
  errorDescription:
    "Terjadi kendala saat menghubungi asisten. Coba kirim ulang pertanyaan Anda.",
  retryLabel: "Coba lagi",
  unconfiguredDescription:
    "Asisten AI belum dikonfigurasi pada lingkungan ini.",
  rateLimitAnonTitle: "Batas penggunaan tercapai",
  rateLimitAnonDescription:
    "Anda telah mencapai batas penggunaan untuk pengunjung. Masuk untuk melanjutkan memakai asisten.",
  rateLimitAnonCta: "Masuk untuk lanjut",
  rateLimitAuthTitle: "Terlalu banyak permintaan",
  rateLimitAuthDescription: "Coba lagi dalam beberapa saat.",
} as const;

/** A recommended-question template. `{wilayah}` / `{tahun}` are interpolated. */
export interface RecommendedTemplate {
  readonly text: string;
  /** True when the template only makes sense with a region/child selected. */
  readonly requiresSelection: boolean;
}

/**
 * Per-page templates. The builder keeps `requiresSelection` entries only when a
 * selection exists, then interpolates `{wilayah}`/`{tahun}`. No AI call is made.
 */
export const AI_RECOMMENDED_TEMPLATES: Record<
  AiPageId,
  readonly RecommendedTemplate[]
> = {
  map: [
    {
      text: "Wilayah mana yang prevalensinya tertinggi tahun {tahun}?",
      requiresSelection: false,
    },
    {
      text: "5 wilayah dengan stunting terendah {tahun}",
      requiresSelection: false,
    },
    {
      text: "Bagaimana tren {wilayah} dari 2021 ke 2024?",
      requiresSelection: true,
    },
    {
      text: "Bandingkan {wilayah} dengan wilayah lain tahun {tahun}",
      requiresSelection: true,
    },
  ],
  data: [
    {
      text: "Indikator apa yang paling terkait dengan stunting?",
      requiresSelection: false,
    },
    {
      text: "Bagaimana tren stunting nasional 2021-2024?",
      requiresSelection: false,
    },
    {
      text: "Bagaimana posisi {wilayah} dibanding rata-rata nasional?",
      requiresSelection: true,
    },
    {
      text: "Bagaimana tren {wilayah} beberapa tahun terakhir?",
      requiresSelection: true,
    },
  ],
  prediksi: [
    {
      text: "Apa itu model GTWENOLR dan seberapa akurat?",
      requiresSelection: false,
    },
    {
      text: "Apa arti prediksi model untuk {wilayah}?",
      requiresSelection: true,
    },
    {
      text: "Bagaimana prediksi {wilayah} tahun {tahun}?",
      requiresSelection: true,
    },
  ],
  tracker: [
    {
      text: "Bagaimana status pertumbuhan anak saya?",
      requiresSelection: true,
    },
    { text: "Imunisasi apa yang akan datang?", requiresSelection: true },
    { text: "Apakah ada keterlambatan perkembangan?", requiresSelection: true },
    {
      text: "Apa itu stunting dan bagaimana mencegahnya?",
      requiresSelection: false,
    },
  ],
};

/** Generic starter shown when a page has no selection-specific suggestions. */
export const AI_RECOMMENDED_FALLBACK: readonly string[] = [
  "Apa itu stunting?",
  "Apa saja faktor penyebab stunting?",
];
