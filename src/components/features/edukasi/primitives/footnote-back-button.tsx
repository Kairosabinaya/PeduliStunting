"use client";

// Small `<button>` that calls `history.back()` so a reader who jumped to
// a footnote can return to the exact reading position they came from.
// Falls back to scrolling to the page top if the history entry isn't
// from inside the page (e.g. user deep-linked to the footnote id).

import { CLOSING_COPY } from "@/config/edukasi";

export interface FootnoteBackButtonProps {
  /** Display number used in the ARIA label so screen readers announce
   * "Kembali ke teks dari catatan kaki 3" instead of a generic "back". */
  readonly number: number;
}

export function FootnoteBackButton({ number }: FootnoteBackButtonProps) {
  const handleClick = () => {
    if (typeof window === "undefined") return;
    // history.length > 1 is a hint that we have a previous entry to go
    // back to. If the user landed here via direct URL, that's still 1 —
    // in that case we scroll to the top instead of pushing them away.
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={CLOSING_COPY.footnoteBackAriaTemplate(number)}
      className="inline-flex items-center gap-1 rounded text-xs font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
    >
      <span aria-hidden="true">↑</span>
      <span>{CLOSING_COPY.footnoteBackLabel}</span>
    </button>
  );
}
