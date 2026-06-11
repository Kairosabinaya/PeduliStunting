"use client";

// Client component because motion's useInView depends on the browser
// IntersectionObserver API.

import { Children, isValidElement } from "react";
import { motion, useReducedMotion } from "motion/react";

import {
  EDU_DURATION,
  EDU_EASE,
  EDU_INVIEW_MARGIN,
  EDU_WORD_STAGGER_MS,
} from "@/config/edukasi";

export interface StaggerRevealProps {
  /** Items to reveal in sequence. Each is wrapped in its own motion.span. */
  readonly children: React.ReactNode;
  /** Delay between each child in milliseconds. Defaults to `EDU_WORD_STAGGER_MS`. */
  readonly staggerMs?: number;
  /** Optional initial offset distance in pixels. Defaults to 12px. */
  readonly offsetPx?: number;
  /** Tag for the outer wrapper. Defaults to `span` so inline contexts (headings) work. */
  readonly as?: "span" | "div";
  /** Class applied to the wrapper element. */
  readonly className?: string;
  /**
   * `"in-view"` (default) animates via motion when scrolled into view.
   * `"mount"` renders a CSS-only reveal that starts the moment stylesheets
   * apply — REQUIRED for above-the-fold content: the motion variant holds
   * `opacity: 0` until hydration, which excludes the element from Largest
   * Contentful Paint and stalls LCP behind the whole JS pipeline.
   */
  readonly trigger?: "in-view" | "mount";
}

/** CSSProperties extended with the reveal offset custom property. */
type RevealMountStyle = React.CSSProperties & {
  readonly "--edu-rise-offset": string;
};

/**
 * Reveal child elements one-by-one as the wrapper enters the viewport. Each
 * child is wrapped in a motion.span with a small upward translate + opacity
 * fade. Reduced-motion users receive an instant render of the final state.
 *
 * Children that are not React elements (raw strings) are still wrapped in
 * their own span so the stagger applies word-by-word when the parent splits
 * a sentence into spans up-front.
 *
 * @example Per-word headline reveal
 * ```tsx
 * <h1>
 *   <StaggerReveal>
 *     <span>1</span>
 *     <span>dari</span>
 *     <span>5</span>
 *   </StaggerReveal>
 * </h1>
 * ```
 */
export function StaggerReveal({
  children,
  staggerMs = EDU_WORD_STAGGER_MS,
  offsetPx = 12,
  as = "span",
  className,
  trigger = "in-view",
}: StaggerRevealProps) {
  const reduceMotion = useReducedMotion();
  const Wrapper = as === "div" ? motion.div : motion.span;

  const items = Children.toArray(children);

  if (reduceMotion) {
    // Static fallback — preserve identity so HTML semantics stay clean.
    const StaticWrapper = as === "div" ? "div" : "span";
    return <StaticWrapper className={className}>{children}</StaticWrapper>;
  }

  /**
   * Whitespace-only text nodes are kept as plain text instead of being
   * wrapped in a motion.span. `inline-block` collapses trailing or
   * standalone whitespace inside its own content box, so a "1 dari 5"
   * headline rendered as separate inline-block spans would otherwise
   * read as "1dari5". By passing bare " " straight through, the
   * surrounding text-flow keeps natural word spacing.
   */
  const isWhitespaceOnly = (child: unknown): child is string =>
    typeof child === "string" && /^\s+$/.test(child);

  /**
   * `<br/>` elements must NOT be wrapped in motion.span — `inline-block`
   * would override `display: block` and prevent the line break entirely.
   * Render bare `<br/>` so the headline actually wraps.
   */
  const isBrElement = (child: unknown): boolean => {
    if (!isValidElement(child)) return false;
    return (child as { type?: unknown }).type === "br";
  };

  if (trigger === "mount") {
    // CSS-only path: each word carries `.edu-reveal-mount` plus an inline
    // stagger delay, so the wave starts at first paint (pre-hydration) and
    // the words remain LCP-eligible the whole time (opacity stays 1; the
    // keyframes animate translate + blur only). Reduced-motion is handled
    // by the stylesheet, not React, so SSR output is identical for all.
    const StaticWrapper = as === "div" ? "div" : "span";
    // Stagger position per item index, skipping whitespace and <br/> so the
    // wave timing matches motion's staggerChildren behaviour. Built as a
    // local Map (no render-scope reassignment, react-hooks/immutability).
    const revealOrder = new Map<number, number>();
    items.forEach((child, index) => {
      if (isWhitespaceOnly(child) || isBrElement(child)) return;
      revealOrder.set(index, revealOrder.size);
    });
    return (
      <StaticWrapper className={className}>
        {items.map((child, index) => {
          if (isWhitespaceOnly(child)) return child;
          if (isBrElement(child)) return <br key={`br-${index}`} />;
          const style: RevealMountStyle = {
            animationDelay: `${(revealOrder.get(index) ?? 0) * staggerMs}ms`,
            "--edu-rise-offset": `${offsetPx}px`,
          };
          return (
            <span
              key={
                isValidElement(child) && child.key !== null ? child.key : index
              }
              className="edu-reveal-mount inline-block"
              style={style}
            >
              {child}
            </span>
          );
        })}
      </StaticWrapper>
    );
  }

  return (
    <Wrapper
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: EDU_INVIEW_MARGIN }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerMs / 1000,
            delayChildren: 0,
          },
        },
      }}
    >
      {items.map((child, index) => {
        if (isWhitespaceOnly(child)) {
          // Bare text node — siblings around it (the motion.spans) flow
          // as inline-block; the browser treats this string as the
          // gap-between-words text content of the wrapper. No span
          // wrapper is needed and crucially we avoid the inline-block
          // whitespace-collapse trap.
          return child;
        }
        if (isBrElement(child)) {
          return <br key={`br-${index}`} />;
        }
        return (
          <motion.span
            key={
              isValidElement(child) && child.key !== null ? child.key : index
            }
            variants={{
              hidden: { opacity: 0, y: offsetPx, filter: "blur(6px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: {
                  duration: EDU_DURATION.slowMs / 1000,
                  ease: EDU_EASE.emphasized,
                },
              },
            }}
            style={{ display: "inline-block" }}
          >
            {child}
          </motion.span>
        );
      })}
    </Wrapper>
  );
}
