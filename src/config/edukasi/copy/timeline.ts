/**
 * Copy for ACT 5 — 1.000 Hari Pertama Kehidupan pinned scroll.
 * Six-frame morph visual + scroll-linked day counter. Frame data hidup
 * di `src/data/edukasi/timeline.ts`.
 */

export const TIMELINE_COPY = {
  eyebrow: "1.000 hari",
  headlineLead: "270 hari di rahim,",
  headlineHighlight: {
    value: "730 hari setelahnya.",
    variant: "primary" as const,
  },
  headlineTail: "Masa penting yang membentuk masa depan anak.",
  helper:
    "Gulir untuk mengikuti perjalanan dari konsepsi hingga ulang tahun kedua. Setiap fase menampilkan apa yang terjadi dan apa yang perlu dilakukan keluarga.",
  dayLabel: "Hari ke-",
  ofTotalLabel: "dari 1.000",
  actionsTitle: "Yang perlu dilakukan",
  scrollHint: "Gulir di area peta hari →",
  reduceMotionFallbackTitle: "Mode tanpa animasi",
  reduceMotionFallbackBody:
    "Mengikuti preferensi tampilan Anda, enam fase ditampilkan sebagai daftar vertikal — bukan animasi morph yang mengikuti scroll.",
} as const;
