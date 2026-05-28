"use client";

// Cross-fade illustration that swaps SVG variants based on the active
// frame id. Each variant is a tiny hand-rolled SVG that conveys the size
// analogy of the milestone — meant as a placeholder until Midjourney
// IMG-03..IMG-06 assets are dropped in.

import { motion } from "motion/react";

import type { TimelineFrame } from "@/data/edukasi/timeline";

export interface TimelineIllustrationProps {
  readonly frame: TimelineFrame;
}

interface FrameVisualProps {
  readonly title: string;
}

function Trimester1Visual({ title }: FrameVisualProps) {
  return (
    <svg
      viewBox="0 0 320 320"
      role="img"
      aria-labelledby="t1-title"
      className="h-full w-full"
    >
      <title id="t1-title">{title}</title>
      <circle cx="160" cy="160" r="130" className="fill-edu-tint-warm" />
      <circle
        cx="160"
        cy="170"
        r="56"
        className="fill-accent/20 stroke-accent"
        strokeWidth="2"
      />
      <path
        d="M150 158 c4 -8, 16 -8, 18 0 c2 6, -2 12, -10 18 c-8 -6, -10 -12, -8 -18 z"
        className="fill-primary/60"
      />
      <text
        x="160"
        y="248"
        textAnchor="middle"
        className="fill-foreground/60"
        fontSize="13"
      >
        Sebesar jeruk nipis
      </text>
    </svg>
  );
}

function Trimester2Visual({ title }: FrameVisualProps) {
  return (
    <svg
      viewBox="0 0 320 320"
      role="img"
      aria-labelledby="t2-title"
      className="h-full w-full"
    >
      <title id="t2-title">{title}</title>
      <ellipse
        cx="160"
        cy="160"
        rx="120"
        ry="130"
        className="fill-edu-tint-warm"
      />
      <ellipse
        cx="160"
        cy="160"
        rx="50"
        ry="84"
        className="fill-edu-warm/40 stroke-edu-warm"
        strokeWidth="2"
      />
      <g
        className="stroke-primary"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      >
        <line x1="155" y1="105" x2="165" y2="215" />
        <line x1="148" y1="120" x2="172" y2="120" />
        <line x1="146" y1="140" x2="174" y2="140" />
        <line x1="145" y1="160" x2="175" y2="160" />
        <line x1="146" y1="180" x2="174" y2="180" />
        <line x1="148" y1="200" x2="172" y2="200" />
      </g>
      <text
        x="160"
        y="266"
        textAnchor="middle"
        className="fill-foreground/60"
        fontSize="13"
      >
        Sebesar jagung
      </text>
    </svg>
  );
}

function Trimester3Visual({ title }: FrameVisualProps) {
  return (
    <svg
      viewBox="0 0 320 320"
      role="img"
      aria-labelledby="t3-title"
      className="h-full w-full"
    >
      <title id="t3-title">{title}</title>
      <circle cx="160" cy="160" r="140" className="fill-edu-tint-warm" />
      <ellipse
        cx="160"
        cy="166"
        rx="92"
        ry="76"
        className="fill-accent/30 stroke-accent"
        strokeWidth="2"
      />
      <path
        d="M70 166 q90 -50, 180 0"
        stroke="rgb(var(--color-foreground)/0.18)"
        strokeWidth="2"
        fill="none"
      />
      <text
        x="160"
        y="270"
        textAnchor="middle"
        className="fill-foreground/60"
        fontSize="13"
      >
        Sebesar semangka
      </text>
    </svg>
  );
}

function NewbornVisual({ title }: FrameVisualProps) {
  return (
    <svg
      viewBox="0 0 320 320"
      role="img"
      aria-labelledby="nb-title"
      className="h-full w-full"
    >
      <title id="nb-title">{title}</title>
      <rect
        x="20"
        y="20"
        width="280"
        height="280"
        rx="32"
        className="fill-edu-tint-cream"
      />
      <g className="stroke-primary" strokeWidth="2.4" fill="none">
        <path d="M100 200 c20 -40, 60 -40, 80 0" />
        <circle cx="140" cy="160" r="22" />
      </g>
      {/* Lambung growth circles */}
      <g
        className="stroke-accent"
        strokeWidth="1.5"
        fill="rgb(var(--color-accent)/0.18)"
      >
        <circle cx="210" cy="160" r="6" />
        <circle cx="232" cy="160" r="10" />
        <circle cx="260" cy="160" r="15" />
        <circle cx="294" cy="160" r="22" />
      </g>
      <text
        x="160"
        y="270"
        textAnchor="middle"
        className="fill-foreground/60"
        fontSize="13"
      >
        ASI eksklusif · lambung tumbuh
      </text>
    </svg>
  );
}

function MpasiVisual({ title }: FrameVisualProps) {
  return (
    <svg
      viewBox="0 0 320 320"
      role="img"
      aria-labelledby="mpasi-title"
      className="h-full w-full"
    >
      <title id="mpasi-title">{title}</title>
      <rect
        x="20"
        y="20"
        width="280"
        height="280"
        rx="32"
        className="fill-edu-tint-cream"
      />
      {/* Baby body */}
      <g className="stroke-primary" strokeWidth="2.4" fill="none">
        <circle cx="120" cy="150" r="28" />
        <path d="M100 178 c0 30, 40 30, 40 0" />
      </g>
      {/* Bowl */}
      <g
        className="stroke-accent"
        strokeWidth="2"
        fill="rgb(var(--color-accent)/0.12)"
      >
        <path d="M180 188 q 28 30, 60 0 l -8 24 q -22 18, -44 0 z" />
        <ellipse cx="210" cy="190" rx="30" ry="6" />
      </g>
      {/* Food group dots */}
      <g className="fill-edu-warm">
        <circle cx="200" cy="120" r="6" />
        <circle cx="220" cy="100" r="5" />
        <circle cx="244" cy="118" r="6" />
        <circle cx="232" cy="140" r="5" />
      </g>
      <text
        x="160"
        y="270"
        textAnchor="middle"
        className="fill-foreground/60"
        fontSize="13"
      >
        MPASI 8 grup makanan
      </text>
    </svg>
  );
}

function ToddlerVisual({ title }: FrameVisualProps) {
  return (
    <svg
      viewBox="0 0 320 320"
      role="img"
      aria-labelledby="toddler-title"
      className="h-full w-full"
    >
      <title id="toddler-title">{title}</title>
      <rect
        x="20"
        y="20"
        width="280"
        height="280"
        rx="32"
        className="fill-edu-tint-warm"
      />
      <g
        className="stroke-primary"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      >
        <circle cx="160" cy="120" r="24" />
        <path d="M160 144 L 160 200" />
        <path d="M160 158 L 130 180" />
        <path d="M160 158 L 192 178" />
        <path d="M160 200 L 138 240" />
        <path d="M160 200 L 184 240" />
      </g>
      <g className="fill-accent">
        <circle cx="124" cy="170" r="4" />
        <circle cx="198" cy="172" r="4" />
      </g>
      <text
        x="160"
        y="278"
        textAnchor="middle"
        className="fill-foreground/60"
        fontSize="13"
      >
        Toddler berjalan
      </text>
    </svg>
  );
}

const VISUAL_MAP: Record<
  TimelineFrame["id"],
  (props: FrameVisualProps) => React.ReactElement
> = {
  "frame-trimester-1": Trimester1Visual,
  "frame-trimester-2": Trimester2Visual,
  "frame-trimester-3": Trimester3Visual,
  "frame-0-6-months": NewbornVisual,
  "frame-6-12-months": MpasiVisual,
  "frame-12-24-months": ToddlerVisual,
};

export function TimelineIllustration({ frame }: TimelineIllustrationProps) {
  const Visual = VISUAL_MAP[frame.id] ?? Trimester1Visual;
  return (
    <motion.div
      key={frame.id}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <Visual title={frame.title} />
    </motion.div>
  );
}
