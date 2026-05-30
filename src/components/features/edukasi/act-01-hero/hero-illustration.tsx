import { cn } from "@/lib/cn";

/**
 * Hero illustration — a warm, flat parent-and-child scene. Drawn as inline SVG
 * so it ships no raster, scales crisply, and adapts to light/dark + the warm
 * landing scope automatically: every fill is a Tailwind `fill-*` utility bound
 * to a design token (no hardcoded colours), so the same component reads cool on
 * the authenticated `/edukasi` page and warm on the landing.
 *
 * Style: rounded flat shapes, single soft palette (terracotta / pine / sage /
 * ochre / cream). The figures are deliberately stylised and non-identifiable —
 * an illustrative motif of care, never an implied real child (credibility
 * guardrail for the thesis context).
 *
 * @example
 * ```tsx
 * <HeroIllustration alt="Ilustrasi ibu memangku bayinya" />
 * ```
 */
export interface HeroIllustrationProps {
  /** Accessible description rendered into the inner <title>. */
  readonly alt: string;
  readonly className?: string;
}

export function HeroIllustration({ alt, className }: HeroIllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-labelledby="hero-illustration-title"
      className={cn("h-auto w-full max-w-md", className)}
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="hero-illustration-title">{alt}</title>

      {/* Soft backdrop disc */}
      <circle cx="200" cy="200" r="170" className="fill-accent/20" />
      {/* Warmth accent — a small sun in the upper corner */}
      <circle cx="318" cy="92" r="30" className="fill-edu-warm" />

      {/* Decorative sage leaves / dots scattered for life */}
      <g className="fill-accent/70">
        <circle cx="70" cy="120" r="7" />
        <circle cx="96" cy="300" r="5" />
        <circle cx="330" cy="270" r="8" />
      </g>

      {/* Parent — seated body as a rounded form */}
      <path
        d="M104 360c0-78 30-150 96-150s96 72 96 150z"
        className="fill-secondary"
      />
      {/* Parent shoulder/arm cradling */}
      <path
        d="M150 268c34-26 78-26 112 0 12 9 6 30-9 28-32-5-62-5-94 0-15 2-21-19-9-28z"
        className="fill-secondary"
      />
      {/* Parent head */}
      <circle cx="200" cy="150" r="46" className="fill-primary-soft" />
      {/* Parent hair */}
      <path
        d="M154 150a46 46 0 0 1 92 0c0-14-6-22-14-22 2-12-10-22-32-22s-34 12-32 24c-8 2-14 8-14 20z"
        className="fill-secondary"
      />

      {/* Child — cradled in the arm, smaller, terracotta wrap */}
      <ellipse cx="206" cy="266" rx="44" ry="30" className="fill-primary" />
      {/* Child head */}
      <circle cx="168" cy="258" r="22" className="fill-primary-soft" />
      {/* Child cheek glow */}
      <circle cx="160" cy="264" r="4" className="fill-edu-warm/70" />

      {/* Heart connecting them */}
      <path
        d="M250 150c5-9 19-9 19 3 0 8-12 15-19 21-7-6-19-13-19-21 0-12 14-12 19-3z"
        className="fill-edu-flag"
      />
    </svg>
  );
}
