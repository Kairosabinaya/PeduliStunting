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
  /**
   * `"in-view"` (default) animates via motion when scrolled into view.
   * `"mount"` renders a CSS-only rise that starts at first paint — use for
   * above-the-fold blocks: the motion variant holds `opacity: 0` until
   * hydration, which excludes the block from Largest Contentful Paint.
   */
  readonly trigger?: "in-view" | "mount";
}

/** CSSProperties extended with the reveal offset custom property. */
type RevealMountStyle = React.CSSProperties & {
  readonly "--edu-rise-offset": string;
};

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
  trigger = "in-view",
}: FadeInViewProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    const StaticTag = as;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  if (trigger === "mount") {
    // CSS-only path: the rise starts when stylesheets apply (pre-hydration)
    // and content stays LCP-eligible (opacity remains 1 throughout).
    const StaticTag = as;
    const style: RevealMountStyle = {
      animationDelay: `${delayMs}ms`,
      "--edu-rise-offset": `${offsetPx}px`,
    };
    return (
      <StaticTag
        className={className ? `edu-fade-mount ${className}` : "edu-fade-mount"}
        style={style}
      >
        {children}
      </StaticTag>
    );
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
