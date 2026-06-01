import { edukasiFootnoteHref } from "@/config/edukasi";
import { getEdukasiFootnoteNumber } from "@/data/edukasi/footnotes";

export interface FootnoteRefProps {
  /** Stable footnote id (e.g. `fn-prevalence`). */
  readonly id: string;
  /** Optional class merged onto the anchor; rarely needed. */
  readonly className?: string;
}

/**
 * Superscript link to a footnote. Renders a uniform asterisk marker so the
 * reference reads as a discreet footnote cue rather than a large digit that
 * could be misread as part of the adjacent statistic. The destination entry
 * in {@link FootnoteList} stays numbered and lights up on navigation, so the
 * reader can still tell which source the marker pointed to. The ARIA label
 * keeps the derived number so screen readers announce "Catatan kaki N, link"
 * rather than just an asterisk.
 *
 * Falls back to nothing when the id is unknown so a missing footnote does
 * not crash the page (rendering nothing makes the regression obvious in the
 * lint pass while keeping the page readable).
 *
 * @example In headline
 * ```tsx
 * <h1>1 dari 5<FootnoteRef id="fn-prevalence" /> balita…</h1>
 * ```
 */
export function FootnoteRef({ id, className }: FootnoteRefProps) {
  const number = getEdukasiFootnoteNumber(id);
  if (number === null) return null;
  return (
    <sup className="leading-none">
      <a
        href={edukasiFootnoteHref(id)}
        className={className ?? "fn-ref"}
        aria-label={`Catatan kaki ${number}`}
      >
        <span aria-hidden="true">*</span>
      </a>
    </sup>
  );
}
