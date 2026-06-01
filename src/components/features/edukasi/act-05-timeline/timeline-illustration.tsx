"use client";

// Cross-fade illustration that swaps the raster artwork based on the active
// frame id. Each frame's square PNG carries its own coloured blob behind the
// figure, so it renders straight (no backing panel) and stays legible in both
// themes. `object-contain` fits the art inside the frame box without cropping.

import Image from "next/image";
import { motion } from "motion/react";

import type { TimelineFrame } from "@/data/edukasi/timeline";

export interface TimelineIllustrationProps {
  readonly frame: TimelineFrame;
}

/**
 * Animated frame illustration. The wrapper fills its parent (the parent sets
 * the fixed square box via `.edu-frame-box`); the PNG is `object-contain` over
 * a light rounded panel.
 *
 * @example
 * ```tsx
 * <div className="edu-frame-box relative">
 *   <AnimatePresence mode="wait" initial={false}>
 *     <TimelineIllustration frame={activeFrame} />
 *   </AnimatePresence>
 * </div>
 * ```
 */
export function TimelineIllustration({ frame }: TimelineIllustrationProps) {
  return (
    <motion.div
      key={frame.id}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
      className="absolute inset-0"
    >
      <Image
        src={frame.image}
        alt={frame.title}
        fill
        sizes="(max-width: 1024px) 80vw, 38vw"
        className="object-contain"
      />
    </motion.div>
  );
}
