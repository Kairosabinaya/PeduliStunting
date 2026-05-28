// Hand-rolled simplified outline of the Indonesian archipelago. Not a
// cartographically accurate map — just enough silhouette to anchor the
// CTA toward /map. Labels for the highlighted provinces live in a
// separate legend in `map-bridge-section.tsx` so they cannot overlap
// each other inside the SVG.

import { cn } from "@/lib/cn";

export interface IndonesiaOutlineProps {
  readonly className?: string;
  readonly ariaLabel: string;
}

export function IndonesiaOutline({
  className,
  ariaLabel,
}: IndonesiaOutlineProps) {
  return (
    <svg
      viewBox="0 0 640 280"
      role="img"
      aria-label={ariaLabel}
      className={cn("h-full w-full", className)}
      fill="none"
    >
      {/* Sumatra */}
      <path
        d="M70 110 q -10 -45, 30 -70 q 30 -10, 40 30 q 25 10, 30 40 q -15 35, -30 60 q -25 25, -40 5 q -25 -25, -30 -65 z"
        className="fill-primary/10 stroke-primary/40"
        strokeWidth="1.5"
      />
      {/* Java */}
      <path
        d="M170 175 q 60 -20, 130 -10 q 50 8, 90 5 l 20 18 q -50 18, -120 12 q -70 -6, -120 -25 z"
        className="fill-accent/25 stroke-accent"
        strokeWidth="1.5"
      />
      {/* Kalimantan (Borneo) */}
      <path
        d="M230 60 q 35 -25, 90 -10 q 35 15, 40 60 q -10 50, -50 60 q -45 0, -70 -40 q -25 -30, -10 -70 z"
        className="fill-primary/8 stroke-primary/35"
        strokeWidth="1.5"
      />
      {/* Sulawesi */}
      <path
        d="M395 70 q 25 -10, 30 25 q -5 25, 5 50 q 15 5, 20 30 q -10 25, -30 20 q -10 -15, -20 -30 q -15 -20, -10 -45 q 0 -25, 5 -50 z"
        className="fill-primary/12 stroke-primary/45"
        strokeWidth="1.5"
      />
      {/* Papua */}
      <path
        d="M490 95 q 40 -15, 110 0 q 30 15, 35 55 q -15 40, -55 50 q -45 5, -75 -15 q -30 -25, -25 -50 q -5 -25, 10 -40 z"
        className="fill-primary/10 stroke-primary/40"
        strokeWidth="1.5"
      />
      {/* Highlight markers (Bali, Java cluster = Jawa Timur, Kepri = top-left of Sumatra) */}
      <g className="fill-accent">
        <circle cx="365" cy="200" r="10" />
        <circle cx="290" cy="187" r="8" />
        <circle cx="115" cy="90" r="8" />
      </g>
      {/* Contrast marker for NTT (eastern islands) */}
      <circle cx="455" cy="220" r="8" className="fill-edu-flag" />
      {/* Very subtle island labels so the silhouette reads as Indonesia
          without text crowding the highlight markers. The list of
          provinces with their prevalence numbers lives in a separate
          legend below the illustration. */}
      <g
        className="fill-foreground/35"
        fontFamily="var(--font-sans)"
        fontSize="9"
        fontWeight="600"
        textAnchor="middle"
      >
        <text x="115" y="135">
          Sumatra
        </text>
        <text x="240" y="195">
          Jawa
        </text>
        <text x="295" y="115">
          Kalimantan
        </text>
        <text x="410" y="135">
          Sulawesi
        </text>
        <text x="555" y="135">
          Papua
        </text>
      </g>
    </svg>
  );
}
