/**
 * ConnectiveBeat — a short, full-bleed editorial "breath" band between acts.
 * One bold statement (with a marker highlight) that humanises the numbers and
 * carries the emotional throughline. Server component; the gentle reveal is
 * delegated to the client {@link FadeInView} primitive.
 *
 * Tones map to landing tokens: `terracotta` (bg-primary), `pine` (bg-secondary),
 * `paper` (bg-background). Body text on coloured bands is large display type
 * only, so cream-on-terracotta / cream-on-pine clears WCAG AA for large text.
 */

import type { ConnectiveBeat as ConnectiveBeatData } from "@/config/landing-story";
import { cn } from "@/lib/cn";

import { FadeInView } from "@/components/features/edukasi/primitives/fade-in-view";
import { FootnoteRef } from "@/components/features/edukasi/primitives/footnote-ref";
import { HighlightWord } from "@/components/features/edukasi/primitives/highlight-word";

const TONE_BAND: Record<ConnectiveBeatData["tone"], string> = {
  terracotta: "bg-primary text-primary-foreground",
  pine: "bg-secondary text-secondary-foreground",
  paper: "bg-background text-foreground",
};

const TONE_EYEBROW: Record<ConnectiveBeatData["tone"], string> = {
  terracotta: "text-primary-foreground/75",
  pine: "text-secondary-foreground/75",
  paper: "eyebrow",
};

/** Marker variant per band: light marker on colour, sage marker on paper. */
const TONE_HIGHLIGHT: Record<ConnectiveBeatData["tone"], "white" | "success"> =
  {
    terracotta: "white",
    pine: "white",
    paper: "success",
  };

function renderLine(
  line: string,
  highlight: string,
  variant: "white" | "success",
): React.ReactNode {
  const index = line.indexOf(highlight);
  if (index === -1) return line;
  return (
    <>
      {line.slice(0, index)}
      <HighlightWord variant={variant}>{highlight}</HighlightWord>
      {line.slice(index + highlight.length)}
    </>
  );
}

export function ConnectiveBeat({
  beat,
}: {
  readonly beat: ConnectiveBeatData;
}) {
  return (
    <section
      id={beat.id}
      className={cn(
        "snap-act full-bleed flex min-h-dvh flex-col items-center justify-center px-6 py-20 text-center",
        TONE_BAND[beat.tone],
      )}
    >
      <FadeInView className="container mx-auto max-w-4xl">
        <p
          className={cn(
            "mb-6 text-sm font-semibold uppercase tracking-[0.15em]",
            TONE_EYEBROW[beat.tone],
          )}
        >
          {beat.eyebrow}
        </p>
        <p className="section-headline text-balance">
          {beat.lines.map((line, index) => (
            <span key={line} className="block">
              {renderLine(line, beat.highlight, TONE_HIGHLIGHT[beat.tone])}
              {index === beat.lines.length - 1
                ? beat.footnoteIds.map((id) => <FootnoteRef key={id} id={id} />)
                : null}
            </span>
          ))}
        </p>
      </FadeInView>
    </section>
  );
}
