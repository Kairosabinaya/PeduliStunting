import { CLOSING_COPY } from "@/config/edukasi";
import { EDUKASI_FOOTNOTES } from "@/data/edukasi/footnotes";

import { FootnoteBackButton } from "./footnote-back-button";

/**
 * Rendered list of all footnote sources. Lives at the end of the page
 * (inside ACT 11) and is the target of every {@link FootnoteRef} anchor.
 * Adds a {@link FootnoteBackButton} per item so readers who jumped here
 * have a clear path back. The active target gets a `:target` highlight
 * via the rule in `globals.css`.
 */
export function FootnoteList() {
  return (
    <aside
      aria-labelledby="edu-footnotes-heading"
      className="full-bleed bg-background py-16 sm:py-20"
    >
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <h2
          id="edu-footnotes-heading"
          className="section-headline mb-4 text-foreground"
        >
          {CLOSING_COPY.footnoteHeading}
        </h2>
        <p className="mb-8 max-w-prose text-sm text-muted-foreground">
          {CLOSING_COPY.footnoteIntro}
        </p>
        <ol className="footnotes grid gap-x-8 gap-y-5 text-sm leading-relaxed lg:grid-cols-2">
          {EDUKASI_FOOTNOTES.map((entry, index) => {
            const number = index + 1;
            return (
              <li
                key={entry.id}
                id={entry.id}
                className="grid scroll-mt-32 grid-cols-[auto_1fr] gap-x-4 py-2 pl-3"
              >
                <span
                  aria-hidden="true"
                  className="font-semibold tabular-nums text-primary"
                >
                  {number}.
                </span>
                <div>
                  <p>
                    <strong className="font-semibold text-foreground">
                      {entry.label}
                    </strong>
                    <span className="text-edu-footnote"> — </span>
                    <span className="text-foreground/85">{entry.note}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {entry.sourceUrl ? (
                      <a
                        href={entry.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Buka sumber resmi
                      </a>
                    ) : null}
                    <FootnoteBackButton number={number} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-12 text-xs text-muted-foreground">
          {CLOSING_COPY.lastUpdatedPrefix} {CLOSING_COPY.lastUpdatedDate}.{" "}
          {CLOSING_COPY.caveat}
        </p>
      </div>
    </aside>
  );
}
