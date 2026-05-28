"use client";

// Generic pinned-scroll wrapper used by ACT 2 (Stakes), ACT 4 (Determinant),
// and ACT 5 (Timeline). The container reserves `framesCount * 100vh` of
// scroll length; an inner sticky shell holds the visual.
//
// Children consume the scroll progress via `usePinnedProgress()` so each
// ACT's `useTransform`/`useMotionValueEvent` calls stay inside real
// function components (and lint rules-of-hooks is happy).

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useScroll, type MotionValue } from "motion/react";

import { cn } from "@/lib/cn";

const PinnedProgressContext = createContext<MotionValue<number> | null>(null);

/**
 * Hook for ACT sections rendered inside a `PinnedSection`. Returns the
 * 0→1 scroll progress as a MotionValue. Throws when used outside a
 * pinned section to surface integration bugs early.
 */
export function usePinnedProgress(): MotionValue<number> {
  const ctx = useContext(PinnedProgressContext);
  if (!ctx) {
    throw new Error(
      "usePinnedProgress must be called inside a <PinnedSection>.",
    );
  }
  return ctx;
}

export interface PinnedSectionProps {
  /** Stable section id used as the anchor target. */
  readonly id: string;
  /** Number of stacked frames. Container height = framesCount * 100vh. */
  readonly framesCount: number;
  /** Background variant. */
  readonly tone?: "default" | "cream" | "dark";
  /** Children rendered inside the sticky shell. */
  readonly children: ReactNode;
  /** Optional class merged onto the outer track. */
  readonly className?: string;
  /** Optional aria-label override. */
  readonly ariaLabel?: string;
}

const TONE_CLASS = {
  default: "bg-background text-foreground",
  cream: "bg-edu-tint-cream text-foreground",
  dark: "bg-edu-night text-white",
} as const;

export function PinnedSection({
  id,
  framesCount,
  tone = "default",
  children,
  className,
  ariaLabel,
}: PinnedSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      id={id}
      aria-label={ariaLabel}
      ref={trackRef}
      className={cn("full-bleed relative", TONE_CLASS[tone], className)}
      style={{ height: `${framesCount * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        <PinnedProgressContext.Provider value={scrollYProgress}>
          {children}
        </PinnedProgressContext.Provider>
      </div>
    </section>
  );
}
