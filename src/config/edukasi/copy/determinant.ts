/**
 * Copy for ACT 4 — WHO determinant framework. Data lapisan ada di
 * `src/data/edukasi/determinants.ts`; file ini hanya kerangka section.
 */

export const DETERMINANT_COPY = {
  eyebrow: "Bukan satu sebab, tapi banyak",
  headlineLead: "Stunting bukan sekadar",
  headlineHighlight: { value: "kurang makan", variant: "danger" as const },
  body: "Ia adalah hasil dari rantai sebab yang saling berkaitan — dari kebijakan negara, kondisi sanitasi, sampai keputusan-keputusan kecil di meja makan.",
  bodyFootnoteId: "fn-who-framework",
  helper: "Klik tiap lapisan untuk membuka penjelasan dan bukti riset terkait.",
  outcomeLabel: "Stunting",
  closeButton: "Tutup",
  evidenceLabel: "Bukti",
  layerSelectLabel: "Pilih lapisan determinant",
  quintileTitle: "Disparitas berdasarkan kelompok ekonomi",
  quintileDescription:
    "Prevalensi stunting per quintile ekonomi (SSGI 2024). Q2-Q5 adalah estimasi monoton; angka eksak menunggu rilis BKPK Kemenkes RI.",
  quintileAxisLabel: "Prevalensi (%)",
  quintileNationalLabel: "Rata-rata nasional 19,8%",
} as const;
