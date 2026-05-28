"use client";

import { useId } from "react";

import { cn } from "@/lib/cn";
import {
  DETERMINANT_LAYERS,
  type DeterminantLayer,
} from "@/data/edukasi/determinants";
import { DETERMINANT_COPY } from "@/config/edukasi";

interface ConcentricRingsProps {
  readonly activeId: string | null;
  readonly onSelect: (id: string) => void;
}

// Inner-to-outer ring radii. Centred on (200, 200) inside a 400×400 viewBox
// so the layer 1 disc reads as the "stunting" outcome at the bullseye.
const RING_RADII = [70, 110, 150, 190, 230] as const;

const TONE_TO_FILL: Record<DeterminantLayer["tone"], string> = {
  primary: "fill-primary/10 stroke-primary/40",
  secondary: "fill-primary-soft/10 stroke-primary-soft/40",
  success: "fill-accent/10 stroke-accent/40",
  warm: "fill-edu-warm/10 stroke-edu-warm/60",
  danger: "fill-edu-flag/10 stroke-edu-flag/50",
};

const TONE_TO_ACTIVE: Record<DeterminantLayer["tone"], string> = {
  primary: "fill-primary/25 stroke-primary",
  secondary: "fill-primary-soft/30 stroke-primary-soft",
  success: "fill-accent/30 stroke-accent",
  warm: "fill-edu-warm/35 stroke-edu-warm",
  danger: "fill-edu-flag/30 stroke-edu-flag",
};

export function ConcentricRings({ activeId, onSelect }: ConcentricRingsProps) {
  const titleId = useId();
  // Layer 1 is the innermost circle; render from outermost to innermost so
  // smaller rings cover larger ones, keeping click targets sane.
  const orderedForRender = [...DETERMINANT_LAYERS].sort(
    (a, b) => b.level - a.level,
  );
  return (
    <svg
      viewBox="0 0 480 480"
      role="img"
      aria-labelledby={titleId}
      className="h-full w-full"
    >
      <title id={titleId}>
        Lima lapisan determinant stunting menurut WHO, dengan lapisan kesehatan
        ibu dan anak di pusat dan konteks sosial-ekonomi sebagai lapisan
        terluar.
      </title>
      <g transform="translate(240 240)">
        {orderedForRender.map((layer) => {
          const radius = RING_RADII[layer.level - 1];
          if (!radius) return null;
          const active = activeId === layer.id;
          const className = active
            ? TONE_TO_ACTIVE[layer.tone]
            : TONE_TO_FILL[layer.tone];
          return (
            <g
              key={layer.id}
              className="cursor-pointer transition-[transform,opacity] duration-slow ease-standard"
              style={{
                transformOrigin: "0 0",
                transform: active ? "scale(1.04)" : "scale(1)",
              }}
              onClick={() => onSelect(layer.id)}
            >
              <circle
                r={radius}
                strokeWidth={active ? 2.5 : 1.5}
                className={cn("transition-all duration-slow", className)}
              />
              {/* Label */}
              <text
                y={-radius + 16}
                textAnchor="middle"
                className={cn(
                  "pointer-events-none font-semibold uppercase",
                  active ? "fill-foreground" : "fill-foreground/60",
                )}
                style={{ fontSize: 10, letterSpacing: "0.12em" }}
              >
                L{layer.level}
              </text>
            </g>
          );
        })}
        {/* Outcome label at the centre */}
        <text
          textAnchor="middle"
          dy="6"
          className="pointer-events-none fill-primary font-bold uppercase"
          style={{ fontSize: 14, letterSpacing: "0.18em" }}
        >
          {DETERMINANT_COPY.outcomeLabel}
        </text>
      </g>
    </svg>
  );
}
