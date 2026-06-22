/**
 * Motion + layout tokens for the /edukasi scrollytelling page.
 *
 * Phase 1 uses these constants from JSX/motion props so the no-magic-values
 * rule (no magic Tailwind values, no inline numeric literals for design
 * decisions) is honoured. Durations align with the new
 * `transitionDuration.emphatic` / `.cinematic` Tailwind tokens added in
 * tailwind.config.ts.
 */

export const EDU_DURATION = {
  /** Hover/focus transitions and one-shot fades — matches Tailwind `fast`. */
  fastMs: 120,
  /** Default element-level transitions — matches Tailwind default `180`. */
  baseMs: 180,
  /** Per-word reveal, mid-scroll fades — matches Tailwind `slow`. */
  slowMs: 260,
  /** Big number counter, headline reveal — matches Tailwind `emphatic`. */
  emphaticMs: 600,
  /** Pinned section morph (Phase 2) — matches Tailwind `cinematic`. */
  cinematicMs: 1200,
} as const;

export const EDU_EASE = {
  /** General-purpose easing. Matches Tailwind `standard`. */
  standard: [0.2, 0, 0, 1] as const,
  /** Typography reveal. Matches Tailwind `emphasized`. */
  emphasized: [0.3, 0, 0, 1] as const,
  /** Counter animation. Matches Tailwind `anticipate`. */
  anticipate: [0.65, 0, 0.35, 1] as const,
} as const;

/**
 * Per-word stagger for headline reveals. 80ms gives a clear "wave" without
 * the headline taking more than ~1.5 seconds for typical 5-word lines.
 */
export const EDU_WORD_STAGGER_MS = 80;

/**
 * Pixel margin used by IntersectionObserver/useInView triggers. Negative
 * margin means the trigger fires when the element is comfortably inside
 * the viewport, not the moment its first pixel crosses the edge. Phrased
 * relative to viewport height so behaviour stays consistent across
 * breakpoints.
 */
export const EDU_INVIEW_MARGIN = "-15% 0px -15% 0px" as const;

/**
 * Stable footnote id prefix. Footnote references render `#fn-1` etc., and
 * the FootnoteList renders an `<ol>` with matching ids. The format is also
 * promised in `docs/GLOSSARY.md` so external tooling can deep-link.
 */
export const EDU_FOOTNOTE_PREFIX = "fn-" as const;

/**
 * URL anchors used by ACT 11 to scroll back to specific footnotes from a
 * `<sup>` reference. Centralised so any future re-numbering only happens
 * in `src/data/edukasi/...` (the canonical id list).
 */
export function edukasiFootnoteHref(id: string): string {
  return `#${id}`;
}
