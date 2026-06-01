/**
 * Copy for ACT 3 — the historical timeline. Numerical data series lives in
 * `src/data/edukasi/stunting-timeline.ts`; this file holds the narrative
 * copy and chart accessibility metadata.
 */

export const HISTORY_COPY = {
  eyebrow: "Perjalanan panjang",
  headlineLead: "Indonesia sudah berhasil",
  headlineHighlights: [
    { value: "menurunkan", variant: "success" as const },
    { value: "angka stunting", variant: "primary" as const },
  ],
  headlineTail: "sejak 2013.",
  body: [
    "Dari 37,2% pada 2013 menjadi 19,8% pada 2024. Artinya, sekitar 357.000 anak terhindar dari stunting pada tahun 2024.",
    "Namun, target 14,2% pada 2029 menunjukkan bahwa pekerjaan ini belum selesai.",
  ],
  bodyFootnoteIds: ["fn-rpjmn"] as const,
  chartTitle:
    "Prevalensi stunting nasional 2013–2024 dengan target 2029 & 2045",
  chartDescription:
    "Grafik garis menunjukkan penurunan prevalensi stunting di Indonesia dari 37,2 persen di 2013 menjadi 19,8 persen di 2024. Dua titik proyeksi yaitu 14,2 persen di 2029 dan 5 persen di 2045 menandai target pemerintah.",
  yAxisLabel: "Prevalensi (%)",
  xAxisLabel: "Tahun",
  legendActual: "Capaian",
  legendTarget: "Target",
  tooltipSourcePrefix: "Sumber",
} as const;
