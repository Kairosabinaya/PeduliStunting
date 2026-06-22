"use client";

// Client component: animates a numeric value when scrolled into view. Reads
// the user's reduced-motion preference and snaps to the final value when set,
// matching accessibility expectations.

import { useEffect, useRef, useState } from "react";
import {
  animate,
  useInView,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "motion/react";

import { cn } from "@/lib/cn";
import { EDU_DURATION, EDU_EASE, EDU_INVIEW_MARGIN } from "@/config/edukasi";

export interface AnimatedCounterProps {
  /** Final numeric value to animate to. */
  readonly value: number;
  /** Optional starting value. Defaults to 0. */
  readonly from?: number;
  /** Decimal digits preserved in the formatted output. Defaults to 0. */
  readonly decimals?: number;
  /** Duration in milliseconds. Defaults to `EDU_DURATION.emphaticMs`. */
  readonly durationMs?: number;
  /** Optional suffix appended after the number (e.g. "%"). */
  readonly suffix?: string;
  /** Class applied to the wrapper span. */
  readonly className?: string;
  /** Accessible label override; defaults to the formatted number + suffix. */
  readonly ariaLabel?: string;
  /**
   * Gate the count-up animation behind an external "now visible" signal.
   * Defaults to `true` so existing call sites keep their behaviour.
   *
   * In ACT 2 the counter sits inside a `motion.div` whose `opacity`
   * is scroll-driven — the DOM element enters the viewport at the
   * start of the pinned section, but the user can't actually see it
   * until they scroll deeper. Without gating, the count-up finishes
   * before the frame fades in. Setting `enabled={isFrameActive}`
   * defers the animation until the consumer signals the frame is on
   * screen.
   */
  readonly enabled?: boolean;
}

const ID_FORMATTER_CACHE = new Map<number, Intl.NumberFormat>();

function getFormatter(decimals: number): Intl.NumberFormat {
  const cached = ID_FORMATTER_CACHE.get(decimals);
  if (cached) return cached;
  const fmt = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  ID_FORMATTER_CACHE.set(decimals, fmt);
  return fmt;
}

/**
 * Display-style animated number. Counts up from `from` to `value` when the
 * element first scrolls into view; reduced-motion users see the final value
 * immediately. Uses tabular-nums + tight tracking via the `.display-stat`
 * utility when no override className is supplied so big numbers stay rigid.
 *
 * @example Hero stat
 * ```tsx
 * <AnimatedCounter value={19.8} decimals={1} suffix="%" />
 * ```
 *
 * @example Inline counter inside a card
 * ```tsx
 * <AnimatedCounter value={357000} className="text-3xl font-bold" />
 * ```
 */
export function AnimatedCounter({
  value,
  from = 0,
  decimals = 0,
  durationMs = EDU_DURATION.emphaticMs,
  suffix,
  className,
  ariaLabel,
  enabled = true,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: EDU_INVIEW_MARGIN });
  const reduceMotion = useReducedMotion();
  const formatter = getFormatter(decimals);
  const [display, setDisplay] = useState(() => formatter.format(from));

  useEffect(() => {
    if (!isInView || !enabled) return;
    if (reduceMotion) {
      // Snap directly to the final value via the motion runtime so we
      // don't trigger a synchronous setState inside the effect body. The
      // onUpdate callback flushes the display through the same path the
      // animated case uses, keeping the rendered text consistent.
      const snap = animate(value, value, {
        duration: 0,
        onUpdate: (latest) => setDisplay(formatter.format(latest)),
      });
      return () => snap.stop();
    }
    const controls: AnimationPlaybackControls = animate(from, value, {
      duration: durationMs / 1000,
      ease: EDU_EASE.anticipate,
      onUpdate: (latest) => setDisplay(formatter.format(latest)),
    });
    return () => controls.stop();
  }, [
    decimals,
    durationMs,
    enabled,
    formatter,
    from,
    isInView,
    reduceMotion,
    value,
  ]);

  const finalText = `${formatter.format(value)}${suffix ?? ""}`;
  return (
    <span
      ref={ref}
      className={cn(className ?? "display-stat")}
      aria-label={ariaLabel ?? finalText}
      role="text"
    >
      <span aria-hidden="true">
        {display}
        {suffix}
      </span>
    </span>
  );
}
