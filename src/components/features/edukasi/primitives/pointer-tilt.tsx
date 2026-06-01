"use client";

// Subtle "react to cursor" wrapper: the child tilts a few degrees toward the
// pointer, then springs back when the pointer leaves. Used as the landing's
// one cursor-reactive signature (determinant cards + hero illustration).
//
// Safe by construction:
//   - `useReducedMotion()` → renders a plain <div> (no listeners, no transform).
//   - Only reacts to `pointerType === "mouse"`, so touch/pen (mobile) never tilt.
//   - The 3D illusion is an inline `perspective` + `rotateX/Y`, the same
//     inline-style pattern the myth-card flip already uses (no Tailwind
//     perspective token needed).

import { type ReactNode } from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";

import { cn } from "@/lib/cn";

export interface PointerTiltProps {
  readonly children: ReactNode;
  /** Class applied to the tilting element (the inner motion layer). */
  readonly className?: string;
  /**
   * Class applied to the outer perspective wrapper. Use `h-full` here (with a
   * matching `className="h-full"`) when the tilt sits inside a stretched flex
   * item so the wrapped card can fill the equalised height.
   */
  readonly wrapperClassName?: string;
}

// Max tilt kept small (subtle/elegant intensity) so prominent text/art never
// looks warped. Perspective tuned so the rotation reads as gentle depth.
const MAX_TILT_DEG = 6;
const PERSPECTIVE_PX = 900;
const SPRING = { stiffness: 150, damping: 20, mass: 0.4 } as const;

/**
 * Tilt the wrapped content toward the mouse pointer.
 *
 * @example
 * ```tsx
 * <PointerTilt className="rounded-2xl">
 *   <Card />
 * </PointerTilt>
 * ```
 */
export function PointerTilt({
  children,
  className,
  wrapperClassName,
}: PointerTiltProps) {
  const reduceMotion = useReducedMotion();

  // `useSpring(0, config)` returns a settable spring: calling `.set(v)` makes
  // it ease toward `v`. (Passing a MotionValue source instead would make the
  // spring merely track that source — not what we want here.)
  const rotateX = useSpring(0, SPRING);
  const rotateY = useSpring(0, SPRING);

  if (reduceMotion) {
    return <div className={cn(wrapperClassName, className)}>{children}</div>;
  }

  const handleMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    // Normalised offset from centre, range -0.5..0.5.
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(nx * (MAX_TILT_DEG * 2));
    rotateX.set(-ny * (MAX_TILT_DEG * 2));
  };

  const handleLeave = (): void => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div
      className={wrapperClassName}
      style={{ perspective: `${PERSPECTIVE_PX}px` }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <motion.div
        className={className}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
