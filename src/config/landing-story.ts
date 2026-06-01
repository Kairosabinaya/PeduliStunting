/**
 * Copy + constants for the landing-only signature moments and connective
 * beats. Kept here (not in components) so the landing narrative stays a single
 * source of truth and no string/threshold is hardcoded in JSX (project guidelines §2).
 *
 * Every statistic references a footnote id from {@link EDUKASI_FOOTNOTES} so the
 * inline citations and the closing "Sumber & catatan" list can never drift.
 */

import type { StuntingCategory } from "@/domain/region/value-objects/stunting-category";

/**
 * Cited national figure the choropleth counter tallies UP to: the number of
 * stunted balita in SSGI 2024 (19,8% prevalence = 4.482.340 balita). This is a
 * point-in-time prevalence count, NOT a longitudinal "children saved" figure —
 * the counter only ever counts up to this cited total (credibility guardrail).
 *
 * Source: fn-prevalence (SSGI 2024). If the prevalence figure changes, update
 * the footnote note and this constant together.
 */
export const CHILDREN_AFFECTED_TOTAL = 4_482_340;

/** Severity reveal order for the scrubbed choropleth: low → high (the map
 *  worsens as the reader scrolls, ending on the high-burden districts). */
export const CHOROPLETH_TIER_ORDER: readonly StuntingCategory[] = [
  "Rendah",
  "Sedang",
  "Tinggi",
];

/** Copy for the signature choropleth section (ACT III centrepiece). */
export const CHOROPLETH_COPY = {
  eyebrow: "Sebaran nasional",
  headlinePre: "Stunting tidak tersebar",
  headlineHighlight: "merata",
  headlinePost: "di seluruh negeri.",
  body: "Setiap wilayah punya tantangan yang berbeda. Lihat kondisi 514 kabupaten/kota, dari daerah yang sudah membaik hingga yang masih membutuhkan perhatian.",
  bodyFootnoteId: "fn-prevalence",
  counterLabel: "balita di Indonesia masih mengalami stunting",
  counterFootnoteId: "fn-prevalence",
  legend: {
    rendah: "Rendah (<20%)",
    sedang: "Sedang (20–29,9%)",
    tinggi: "Tinggi (≥30%)",
  },
  /** Accessible description used as the SVG `aria-label` + sr-only summary. */
  mapAriaLabel:
    "Peta sebaran prevalensi stunting 514 kabupaten/kota Indonesia menurut SSGI 2024, dikelompokkan rendah, sedang, dan tinggi.",
  /** CTA into the interactive MapLibre explorer (kept off the landing's
   *  critical path; one click away at `/map`). */
  exploreCta: {
    label: "Jelajahi peta wilayahmu",
    href: "/map",
  },
} as const;

/**
 * Connective emotional beats inserted between the four acts. Each humanises the
 * numbers without inventing individuals or overstating, and cites its source.
 */
export interface ConnectiveBeat {
  readonly id: string;
  readonly eyebrow: string;
  readonly lines: readonly string[];
  /** Word inside the beat to highlight with the marker. */
  readonly highlight: string;
  readonly footnoteIds: readonly string[];
  /** Panel tone for the full-bleed band. */
  readonly tone: "paper" | "pine" | "terracotta";
}

export const CONNECTIVE_BEATS = {
  humanCost: {
    id: "beat-human-cost",
    eyebrow: "Di balik angka",
    lines: [
      "1 dari 5 anak itu,",
      "mungkin tetangga, kerabat, atau keluargamu sendiri.",
    ],
    highlight: "keluargamu",
    footnoteIds: ["fn-prevalence"],
    tone: "terracotta",
  },
  inequity: {
    id: "beat-inequity",
    eyebrow: "Beban yang tidak merata",
    lines: [
      "Prevalensi stunting memang terus menurun sejak 2013.",
      "Namun, 1 dari 5 balita masih mengalaminya, dan bebannya tidak merata.",
    ],
    highlight: "tidak merata",
    footnoteIds: ["fn-rpjmn", "fn-cameron-2016"],
    tone: "pine",
  },
  agency: {
    id: "beat-agency",
    eyebrow: "Yang bisa berubah",
    lines: [
      "Perubahan dimulai dari keputusan kecil setiap hari.",
      "Terutama di 1.000 hari pertama, saat tubuh dan otak anak tumbuh paling cepat.",
    ],
    highlight: "keputusan kecil setiap hari.",
    footnoteIds: ["fn-imd", "fn-mpasi"],
    tone: "paper",
  },
} as const satisfies Record<string, ConnectiveBeat>;
