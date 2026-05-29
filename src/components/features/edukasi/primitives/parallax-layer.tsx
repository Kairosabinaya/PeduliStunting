"use client";

/**
 * Multi-layer scroll parallax wrapper for white scrollytelling sections.
 *
 * Exposes two scroll-tied motion values to a render-prop child so each
 * decorative element decides its own `translateY` and positioning. Two
 * speed presets:
 *   - `deepY` — slow drift (±15vh over the section's scroll range)
 *   - `midY`  — faster drift (±30vh)
 *
 * Reduced-motion users get both values pinned to "0vh" so orbs render
 * static at the positions the consumer specifies — the visual texture
 * stays without the kinetic feel.
 *
 * The wrapper itself is `pointer-events-none` so background orbs never
 * intercept clicks, and `-z-10` so foreground content sits on top.
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLElement>(null);
 * return (
 *   <section ref={ref} className="relative isolate ...">
 *     <ParallaxLayer sectionRef={ref}>
 *       {({ deepY, midY }) => (
 *         <>
 *           <motion.div style={{ y: deepY }} className="absolute -left-16 top-12">
 *             <LandingOrb tint="primary" />
 *           </motion.div>
 *           <motion.div style={{ y: midY }} className="absolute right-0 bottom-16">
 *             <LandingOrb tint="accent" size="md" />
 *           </motion.div>
 *         </>
 *       )}
 *     </ParallaxLayer>
 *     <div className="relative z-10">{content}</div>
 *   </section>
 * );
 * ```
 */

import { type ReactNode, type RefObject } from "react";
import {
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

import { cn } from "@/lib/cn";

export interface ParallaxLayerRenderArgs {
  /** Slow-drift motion value (deep layer). String values in `vh` units. */
  readonly deepY: MotionValue<string>;
  /** Faster-drift motion value (mid layer). String values in `vh` units. */
  readonly midY: MotionValue<string>;
}

export interface ParallaxLayerProps {
  /**
   * Ref to the parent section. `useScroll({ target: ref })` reads scroll
   * progress relative to this element so each section's parallax is
   * independent (no global window listener fights).
   */
  readonly sectionRef: RefObject<HTMLElement | null>;
  /** Render-prop receives the motion values for each depth layer. */
  readonly children: (args: ParallaxLayerRenderArgs) => ReactNode;
  readonly className?: string;
}

/** Translation distance in viewport-height units. Smaller = subtler. */
const DEEP_RANGE_VH = 15;
const MID_RANGE_VH = 30;

export function ParallaxLayer({
  sectionRef,
  children,
  className,
}: ParallaxLayerProps) {
  const reduceMotion = useReducedMotion();
  // `useScroll` with offset "start end" → "end start" gives a 0→1 range
  // spanning the moment the section enters the viewport bottom until it
  // exits the top — full window we have to play with.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const deepY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion
      ? ["0vh", "0vh"]
      : [`${DEEP_RANGE_VH}vh`, `${-DEEP_RANGE_VH}vh`],
  );
  const midY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? ["0vh", "0vh"] : [`${MID_RANGE_VH}vh`, `${-MID_RANGE_VH}vh`],
  );

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {children({ deepY, midY })}
    </div>
  );
}
