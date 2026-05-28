// Hand-rolled SVG placeholder for IMG-01 (hero mother + child). Drawn as
// React component so it picks up the design tokens via `currentColor` and
// `text-*` utilities, and so the file can be swapped for a Midjourney
// asset later without changing any component code.

import { cn } from "@/lib/cn";

export interface HeroIllustrationProps {
  /** Alt text rendered into the inner <title> for accessibility. */
  readonly alt: string;
  readonly className?: string;
}

/**
 * Stylised mother-and-child line drawing. Uses three accent fills tied to
 * design tokens (`text-primary`, `text-primary-soft`, `text-accent`) so the
 * illustration adapts to light + dark themes automatically.
 *
 * Replace with the Midjourney IMG-01 asset by swapping this component's
 * markup for an `<Image>` to the final raster — the public API is stable.
 */
export function HeroIllustration({ alt, className }: HeroIllustrationProps) {
  return (
    <svg
      viewBox="0 0 320 320"
      role="img"
      aria-labelledby="hero-illustration-title"
      className={cn("h-full w-full", className)}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title id="hero-illustration-title">{alt}</title>
      {/* Soft background blob */}
      <g className="text-primary-soft/15">
        <circle cx="170" cy="160" r="120" fill="currentColor" />
      </g>
      {/* Mother silhouette — primary blue */}
      <g className="text-primary" stroke="currentColor" strokeWidth="3.5">
        <path
          d="M120 250
             C 110 220, 105 190, 115 160
             C 122 138, 138 122, 160 118
             C 170 116, 178 116, 188 120"
        />
        {/* Head */}
        <circle cx="148" cy="100" r="22" />
        {/* Hair flow */}
        <path d="M132 90 C 124 100, 124 116, 132 124" />
        {/* Arm cradling baby */}
        <path d="M150 145 C 168 152, 188 156, 204 168" />
      </g>
      {/* Baby in swaddle — accent green */}
      <g className="text-accent" stroke="currentColor" strokeWidth="3">
        <path
          d="M192 160
             C 214 158, 232 168, 240 188
             C 246 204, 238 220, 220 224
             C 200 228, 188 218, 184 200
             Z"
          fill="currentColor"
          fillOpacity="0.18"
        />
        {/* Baby face */}
        <circle cx="208" cy="186" r="12" fill="currentColor" fillOpacity="0" />
        <circle cx="204" cy="184" r="1.6" fill="currentColor" />
        <circle cx="212" cy="184" r="1.6" fill="currentColor" />
        <path d="M204 192 Q 208 195, 212 192" />
      </g>
      {/* Floating reference objects — bowl, vitamin, measuring tape */}
      <g
        className="text-primary-soft"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      >
        {/* Bowl with steam */}
        <path d="M64 230 Q 80 250, 96 230 L 92 244 Q 80 250, 68 244 Z" />
        <path d="M76 222 Q 78 216, 76 210" />
        <path d="M84 222 Q 86 216, 84 210" />
        {/* Pill */}
        <rect
          x="248"
          y="84"
          width="22"
          height="10"
          rx="5"
          fill="currentColor"
          fillOpacity="0.18"
        />
        <line x1="259" y1="84" x2="259" y2="94" />
        {/* Measuring tape spiral */}
        <path d="M76 110 Q 92 102, 100 120 Q 92 140, 76 134 Q 64 124, 76 110 Z" />
        <line x1="84" y1="120" x2="86" y2="124" />
        <line x1="90" y1="116" x2="92" y2="120" />
      </g>
      {/* Tiny accent dots for handcrafted feel */}
      <g className="text-primary/40" fill="currentColor">
        <circle cx="60" cy="60" r="2" />
        <circle cx="280" cy="240" r="2" />
        <circle cx="60" cy="280" r="2" />
      </g>
    </svg>
  );
}
