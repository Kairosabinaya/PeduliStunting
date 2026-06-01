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
    body: "Pada tahun-tahun pertama kehidupan, otak bayi membentuk 700 sampai 1.000 koneksi saraf baru setiap detik. Masa secepat ini tidak akan terulang lagi.",
    footnoteId: "fn-unicef-neurons",
  },
  frameImplication: {
    headline: "Pada usia 3 tahun, 85% perkembangan otak anak sudah terbentuk.",
    tail: "Sebagian besar anak Indonesia belum masuk PAUD pada usia ini.",
    closing:
      "Karena itu, gizi dan stimulasi pada 1.000 hari pertama sangat berpengaruh terhadap kemampuan belajar anak di masa depan.",
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
    helper:
      "Sebagian besar struktur dasar otak sudah terbentuk sejak dalam kandungan.",
    tone: "primary",
  },
  {
    value: 70,
    suffix: "%",
    caption: "Usia 0–1 tahun",
    helper:
      "Otak berkembang sangat cepat. Koneksi saraf pada kecepatan tertingginya.",
    tone: "success",
  },
  {
    value: 85,
    suffix: "%",
    caption: "Usia 1–3 tahun",
    helper:
      "Otak terus mematangkan fungsi penting sebelum anak memasuki tahap berikutnya.",
    tone: "warm",
  },
] as const;
