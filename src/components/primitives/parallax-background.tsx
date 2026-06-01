"use client";

import { motion, useScroll, useTransform } from "motion/react";

export function ParallaxBackground() {
  const { scrollY } = useScroll();

  // Subtle parallax movements
  const y1 = useTransform(scrollY, [0, 1000], [0, 150]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const y3 = useTransform(scrollY, [0, 1000], [0, 80]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Top left blob */}
      <motion.div
        style={{
          y: y1,
          background:
            "radial-gradient(circle, rgba(14,165,233,0.08) 0%, rgba(14,165,233,0) 70%)",
        }}
        className="absolute -left-[10%] -top-[10%] h-[50vw] w-[50vw] rounded-full opacity-60 dark:opacity-20"
      />

      {/* Middle right blob */}
      <motion.div
        style={{
          y: y2,
          background:
            "radial-gradient(circle, rgba(99,102,241,0.06) 0%, rgba(99,102,241,0) 70%)",
        }}
        className="absolute -right-[10%] top-[20%] h-[40vw] w-[40vw] rounded-full opacity-60 dark:opacity-20"
      />

      {/* Bottom left blob */}
      <motion.div
        style={{
          y: y3,
          background:
            "radial-gradient(circle, rgba(16,185,129,0.05) 0%, rgba(16,185,129,0) 70%)",
        }}
        className="absolute left-[5%] top-[60%] h-[45vw] w-[45vw] rounded-full opacity-60 dark:opacity-20"
      />
    </div>
  );
}
