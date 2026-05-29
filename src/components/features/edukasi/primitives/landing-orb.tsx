/**
 * Single decorative orb element. Atomic primitive consumed by
 * `<ParallaxLayer>` to compose ambient depth on white scrollytelling
 * sections. Pure presentation — no motion logic lives here; the parent
 * layer applies any scroll-driven `translateY`.
 *
 * Tokens, not magic values: tint pulls from the brand palette so the orbs
 * read as part of Peduli Stunting's visual language and not a generic
 * "blurry shape" decoration. Light mode uses softer alphas so the orb
 * remains readable under text; dark mode lifts the alpha so the orb is
 * still visible against the near-black background.
 */

import { cn } from "@/lib/cn";

export interface LandingOrbProps {
  /** Tint color preset. Maps to brand or accent palettes. */
  readonly tint?: "primary" | "accent";
  /**
   * Approximate diameter as a Tailwind size class fragment. The class is
   * applied as `h-{size} w-{size}` so spacing-scale tokens stay the source
   * of truth — no `h-[247px]` magic values.
   */
  readonly size?: "md" | "lg" | "xl";
  /** Optional className overlay (for absolute positioning of the parent). */
  readonly className?: string;
}

const SIZE_CLASS: Record<NonNullable<LandingOrbProps["size"]>, string> = {
  md: "h-64 w-64",
  lg: "h-80 w-80",
  xl: "h-96 w-96",
};

const TINT_CLASS: Record<NonNullable<LandingOrbProps["tint"]>, string> = {
  primary: "bg-primary-soft/30 dark:bg-primary-soft/20",
  accent: "bg-accent/25 dark:bg-accent/15",
};

export function LandingOrb({
  tint = "primary",
  size = "lg",
  className,
}: LandingOrbProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-full blur-3xl will-change-transform",
        SIZE_CLASS[size],
        TINT_CLASS[tint],
        className,
      )}
    />
  );
}
