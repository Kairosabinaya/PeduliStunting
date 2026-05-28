"use client";

// Lightweight client wrapper that fades + slides children in when they
// enter the viewport. Used by ACT 3/7/9/11 to bring blocks into view
// without per-component motion plumbing.

import { motion, useReducedMotion } from "motion/react";

import { EDU_DURATION, EDU_EASE, EDU_INVIEW_MARGIN } from "@/config/edukasi";

export interface FadeInViewProps {
  readonly children: React.ReactNode;
  /** Vertical translate offset in pixels. Defaults to 16. */
  readonly offsetPx?: number;
  /** Optional one-shot delay in milliseconds. */
  readonly delayMs?: number;
  /** Class applied to the wrapper. */
  readonly className?: string;
  /** Tag for the wrapper. Defaults to `div`. */
  readonly as?: "div" | "section" | "article" | "header" | "footer";
}

/**
 * Reveal a block when it enters the viewport. Honors `prefers-reduced-motion`
 * by rendering children directly without animation. The trigger only fires
 * once, so scrolling back up does not re-replay the entry.
 *
 * @example Standard fade
 * ```tsx
 * <FadeInView>
 *   <h2 className="section-headline">Tahun-tahun emas</h2>
 *   <p>...</p>
 * </FadeInView>
 * ```
 */
export function FadeInView({
  children,
  offsetPx = 16,
  delayMs = 0,
  className,
  as = "div",
}: FadeInViewProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    const StaticTag = as;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  const MotionTag =
    as === "section"
      ? motion.section
      : as === "article"
        ? motion.article
        : as === "header"
          ? motion.header
          : as === "footer"
            ? motion.footer
            : motion.div;

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: offsetPx }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: EDU_INVIEW_MARGIN }}
      transition={{
        duration: EDU_DURATION.slowMs / 1000,
        ease: EDU_EASE.standard,
        delay: delayMs / 1000,
      }}
    >
      {children}
    </MotionTag>
  );
}
