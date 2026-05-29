"use client";

// ACT 4 — Concentric rings visualisasi WHO determinant framework. Lima
// lingkaran konsentris L1 (pusat = stunting outcome) hingga L5 (terluar =
// konteks sosial-ekonomi).
//
// Dua mode konsumsi:
//   - `activeLevel: number | null` — driven dari scroll progress di parent
//     PinnedSection. Ring level yang sedang aktif dapat fill+stroke penuh;
//     yang lain redup ke 0.25 opacity.
//   - `onSelect` + `activeId` (legacy click mode) — masih didukung untuk
//     reduced-motion fallback di mana scroll-driven tidak relevan.

import { useId } from "react";

import { cn } from "@/lib/cn";
import {
  DETERMINANT_LAYERS,
  type DeterminantLayer,
} from "@/data/edukasi/determinants";
import { DETERMINANT_COPY } from "@/config/edukasi";

interface ConcentricRingsProps {
  /**
   * Click-mode active id. Used by the legacy / reduced-motion fallback.
   * Ignored when `activeLevel` is supplied.
   */
  readonly activeId?: string | null;
  /** Click handler used by the legacy / reduced-motion fallback. */
  readonly onSelect?: (id: string) => void;
  /**
   * Scroll-mode active level (1..5). When supplied, this overrides the
   * click-mode active state — the ring whose `level` matches is rendered
   * as "active", the rest as muted. `null` means no scroll-driven focus
   * yet (initial state).
   */
  readonly activeLevel?: number | null;
}

// Inner-to-outer ring radii. Centred on (240, 240) inside a 480×480
// viewBox so L1 disc reads as the "stunting" outcome at the bullseye.
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

export function ConcentricRings({
  activeId = null,
  onSelect,
  activeLevel = null,
}: ConcentricRingsProps) {
  const titleId = useId();
  // Render outermost first so smaller rings overlap larger ones — click
  // targets stay sane in legacy mode.
  const orderedForRender = [...DETERMINANT_LAYERS].sort(
    (a, b) => b.level - a.level,
  );

  const resolveActive = (layer: DeterminantLayer): boolean => {
    if (activeLevel !== null) return layer.level === activeLevel;
    return activeId === layer.id;
  };

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
          const active = resolveActive(layer);
          // In scroll-driven mode, non-active rings drop to a clearly
          // subordinate opacity so the active layer reads as the focus —
          // matches the user spec "tampilan lingkarannya dibuat lebih
          // menarik" with a clear spotlight rather than uniform display.
          const muted = activeLevel !== null && !active;
          const className = active
            ? TONE_TO_ACTIVE[layer.tone]
            : TONE_TO_FILL[layer.tone];
          const interactive = onSelect !== undefined;
          return (
            <g
              key={layer.id}
              className={cn(
                interactive && "cursor-pointer",
                "transition-[transform,opacity] duration-slow ease-standard",
              )}
              style={{
                transformOrigin: "0 0",
                transform: active ? "scale(1.04)" : "scale(1)",
                opacity: muted ? 0.32 : 1,
              }}
              {...(onSelect ? { onClick: () => onSelect(layer.id) } : {})}
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
