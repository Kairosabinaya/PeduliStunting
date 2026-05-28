/**
 * Copy for ACT 2 — the "kenapa 1.000 hari?" pinned scroll. Three frames
 * (intro / synapse rate / 3 brain development cards) di-drive oleh
 * scroll progress. Konten datang dari KIA hal. 4 + UNICEF.
 */

export const STAKES_COPY = {
  eyebrow: "Mengapa 1.000 hari?",
  frameIntro: {
    title: "Otak bayi terbentuk dengan kecepatan yang luar biasa.",
    helper: "Scroll untuk melihat seberapa cepat.",
  },
  frameRate: {
    label: "koneksi saraf baru per detik",
    rangeMin: 700,
    rangeMax: 1000,
    body: "Setiap detik di tahun-tahun pertama kehidupan, otak bayi membentuk antara 700 sampai 1.000 koneksi saraf baru. Kecepatan ini tidak akan pernah terulang lagi seumur hidupnya.",
    footnoteId: "fn-unicef-neurons",
  },
  frameImplication: {
    headline: "Pada usia 3 tahun, 85% perkembangan otak sudah terjadi —",
    tail: "sebelum sebagian besar anak Indonesia bahkan masuk PAUD.",
    closing:
      "Karena itu, gizi dan stimulasi di 1.000 hari pertama menentukan sebagian besar masa depan kemampuan belajar anak.",
    footnoteId: "fn-brain-window",
  },
} as const;

export interface BrainDevelopmentTile {
  readonly value: number;
  readonly suffix: string;
  readonly caption: string;
  readonly helper: string;
  readonly tone: "primary" | "success" | "warm";
}

export const BRAIN_DEVELOPMENT_TILES: readonly BrainDevelopmentTile[] = [
  {
    value: 25,
    suffix: "%",
    caption: "Saat lahir",
    helper: "Sebagian besar struktur dasar sudah terbentuk di rahim.",
    tone: "primary",
  },
  {
    value: 70,
    suffix: "%",
    caption: "Usia 0–1 tahun",
    helper: "Fase paling pesat — sinapsis dibentuk dengan kecepatan puncak.",
    tone: "success",
  },
  {
    value: 85,
    suffix: "%",
    caption: "Usia 1–3 tahun",
    helper:
      "Jendela penyempurnaan terakhir sebelum tahap belajar formal dimulai.",
    tone: "warm",
  },
] as const;
