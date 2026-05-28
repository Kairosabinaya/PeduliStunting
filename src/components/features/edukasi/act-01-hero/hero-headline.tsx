"use client";

// Client component because the per-word reveal depends on
// IntersectionObserver via motion's useInView.

import { useMemo } from "react";

import { HERO_COPY, type HeroHeadlineWord } from "@/config/edukasi";

import { FootnoteRef } from "../primitives/footnote-ref";
import { HighlightWord } from "../primitives/highlight-word";
import { StaggerReveal } from "../primitives/stagger-reveal";

/**
 * Splits a text word into alternating word + whitespace tokens. Words and
 * whitespace are emitted as **separate** tokens so the consumer can wrap
 * words in inline-block motion spans (for transform animations) while
 * keeping whitespace as bare text nodes (so it never collapses inside an
 * inline-block content box).
 *
 * @example
 * splitTextWord("1 dari 5") // ["1", " ", "dari", " ", "5"]
 * splitTextWord("balita Indonesia") // ["balita", " ", "Indonesia"]
 * splitTextWord("") // [""]
 */
export function splitTextWord(value: string): readonly string[] {
  if (value.length === 0) return [""];
  const tokens = value.split(/(\s+)/);
  const filtered = tokens.filter((token) => token.length > 0);
  return filtered.length > 0 ? filtered : [value];
}

/**
 * Hero headline. Composed from the structured `HERO_COPY.headline` data so
 * the component file stays markup-only and content edits go through config.
 *
 * Each text token is wrapped in a <span> child of the StaggerReveal so the
 * reveal happens per word, matching The Pudding-style headline reveals.
 */
export function HeroHeadline() {
  // Pre-flatten the structured headline into a stable array of children so
  // motion's variant tree only needs to look one level deep.
  const items = useMemo(() => {
    const out: React.ReactNode[] = [];
    HERO_COPY.headline.forEach((word: HeroHeadlineWord, wordIndex) => {
      if (word.kind === "break") {
        // Use an actual `<br/>` because the wrapping `motion.span`
        // forces `display: inline-block`, which would override any
        // `display: block` we set on a span and leave the headline as
        // one flat line. StaggerReveal detects `<br/>` children and
        // renders them as-is (not wrapped) so the line break sticks.
        out.push(<br key={`br-${wordIndex}`} />);
        return;
      }
      if (word.kind === "footnote") {
        out.push(
          <span key={`fn-${word.id}-${wordIndex}`}>
            <FootnoteRef id={word.id} />
          </span>,
        );
        return;
      }
      if (word.kind === "highlight") {
        out.push(
          <span key={`hl-${wordIndex}`} className="inline-block">
            <HighlightWord variant={word.variant}>{word.value}</HighlightWord>
          </span>,
        );
        return;
      }
      // Plain text — emit each word token as a span and each whitespace
      // run as a raw string. `StaggerReveal` detects whitespace-only
      // string children and renders them as plain text instead of
      // wrapping them in an inline-block motion.span (which would
      // collapse the whitespace and produce "1dari5").
      splitTextWord(word.value).forEach((token, tokenIndex) => {
        if (/^\s+$/.test(token)) {
          out.push(token);
        } else {
          out.push(<span key={`txt-${wordIndex}-${tokenIndex}`}>{token}</span>);
        }
      });
    });
    return out;
  }, []);

  // Pass the mixed array of strings + React elements straight through to
  // StaggerReveal. Wrapping each item in a `<Fragment>` previously made
  // StaggerReveal's `typeof child === "string"` whitespace check fail
  // (Fragments are objects, not strings), so single-space tokens fell
  // into the `motion.span display:inline-block` wrapper and collapsed
  // to width 0. Bare strings now reach the check correctly and render
  // as plain text nodes with intact word spacing.
  return (
    <h1 className="display-headline text-balance text-foreground">
      <StaggerReveal>{items}</StaggerReveal>
    </h1>
  );
}
