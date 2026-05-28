/**
 * Copy for ACT 7 — the mitos vs fakta grid. The card data itself lives in
 * `src/data/edukasi/myths.ts`; this file holds only the section header copy
 * and labels rendered around the grid.
 */

export const MYTHS_COPY = {
  eyebrow: "Pause dulu",
  headlineLead: "Banyak",
  headlineHighlights: [
    { value: "mitos", variant: "danger" as const },
    { value: "fakta", variant: "success" as const },
  ],
  headlineMid: "yang masih beredar. Buka kartu untuk mengungkap",
  headlineTail: "nya.",
  helperText:
    "Setiap kartu mengutip halaman atau survei sumber sehingga Anda bisa memeriksa sendiri.",
  mythBadge: "Mitos",
  factBadge: "Fakta",
  showFactCta: "Lihat fakta",
  hideFactCta: "Kembali ke mitos",
  backFaceHint: "Ketuk kartu untuk kembali ke mitos",
  sourceLabel: "Sumber",
} as const;
