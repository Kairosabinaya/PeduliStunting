/**
 * Copy for ACT 1 — the hero cold-open. Every user-facing string and number
 * for ACT 1 lives here so the component file stays markup-only.
 *
 * Numerical references match footnote ids in
 * `src/data/edukasi/footnotes.ts`.
 */

export const HERO_COPY = {
  eyebrow: "Mulai dari 1.000 hari pertama",
  /**
   * Headline rendered word-by-word in ACT 1. Each entry is a `HeadlineWord`
   * variant so the renderer can apply HighlightWord variants without parsing
   * markdown at runtime.
   */
  headline: [
    { kind: "text", value: "1 dari 5" } as const,
    { kind: "footnote", id: "fn-prevalence" } as const,
    { kind: "break" } as const,
    { kind: "text", value: "balita Indonesia" } as const,
    { kind: "break" } as const,
    // Trailing space is intentional — without it the next token (the
    // "stunting" highlight pill) renders flush against "mengalami". The
    // hero renderer detects whitespace tokens from `splitTextWord` and
    // emits them as bare text nodes, restoring the gap between words.
    { kind: "text", value: "mengalami " } as const,
    {
      kind: "highlight",
      value: "stunting",
      variant: "primary" as const,
    } as const,
    { kind: "text", value: "." } as const,
  ],
  lead: [
    { kind: "text", value: "" } as const,
    {
      kind: "text",
      value: "Angka itu masih bisa berubah. Kuncinya ada pada ",
    } as const,
    {
      kind: "highlight",
      value: "1.000 hari pertama",
      variant: "success" as const,
    } as const,
    { kind: "text", value: " kehidupan." } as const,
  ],
  factLine:
    "Berdasarkan SSGI 2024, 19,8% balita Indonesia mengalami stunting, sekitar 4.482.340 anak.",
  scrollPrompt: "Scroll untuk memahami",
  illustrationAlt:
    "Ilustrasi garis seorang ibu memangku bayinya, dikelilingi simbol gizi dan pengukuran.",
} as const;

/**
 * Hero illustration raster asset. Square (1000x1000) PNG with a transparent
 * background, so the consuming component sits it on a light backing panel that
 * stays light in dark mode (the dark line-art would otherwise vanish). Path
 * lives here so the component stays free of hardcoded asset strings.
 */
export const HERO_ILLUSTRATION = {
  src: "/edukasi/hero-ibu-pangku-anak.webp",
  width: 1000,
  height: 1000,
} as const;

/**
 * Discriminated union for the headline renderer. Kept exported so component
 * tests can reach the structure without importing the literal copy.
 */
export type HeroHeadlineWord =
  | { readonly kind: "text"; readonly value: string }
  | { readonly kind: "break" }
  | { readonly kind: "footnote"; readonly id: string }
  | {
      readonly kind: "highlight";
      readonly value: string;
      readonly variant: "primary" | "success";
    };
