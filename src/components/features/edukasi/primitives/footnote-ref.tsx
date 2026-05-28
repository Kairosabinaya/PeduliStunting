import { edukasiFootnoteHref } from "@/config/edukasi";
import { getEdukasiFootnoteNumber } from "@/data/edukasi/footnotes";

export interface FootnoteRefProps {
  /** Stable footnote id (e.g. `fn-prevalence`). */
  readonly id: string;
  /** Optional class merged onto the anchor; rarely needed. */
  readonly className?: string;
}

/**
 * Superscript link to a footnote. Renders the display number derived from
 * footnote array order so authors never type literal "1" / "2" — they
 * reference the stable id. Includes ARIA metadata so screen readers
 * announce "footnote N, link" rather than just the digit.
 *
 * Falls back to an empty string when the id is unknown so a missing
 * footnote does not crash the page (rendering nothing makes the
 * regression obvious in the lint pass while keeping the page readable).
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
        {number}
      </a>
    </sup>
  );
}
