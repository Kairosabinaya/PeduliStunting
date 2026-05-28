"use client";

import { Children, isValidElement, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

interface MotionStackProps {
  /** Stagger increment between siblings, in seconds. */
  readonly stagger?: number;
  /** Initial delay before the first child animates in. */
  readonly delay?: number;
  /** Translate-Y distance (px) the children start from. */
  readonly distance?: number;
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Fade + translate-up stagger for the children passed to it. Used by the
 * auth pages so brand panel sections and form fields don't all snap into
 * existence at the same instant.
 *
 * Honours `prefers-reduced-motion`: when reduced motion is on, the
 * wrapper renders children verbatim with zero motion overhead (no
 * `motion.div` mount at all).
 *
 * @example
 * ```tsx
 * <MotionStack stagger={0.05}>
 *   <Input ... />
 *   <Input ... />
 *   <Button ...>Masuk</Button>
 * </MotionStack>
 * ```
 */
export function MotionStack({
  stagger = 0.06,
  delay = 0,
  distance = 8,
  children,
  className,
}: MotionStackProps) {
  const reducedMotion = useReducedMotion();
  const array = Children.toArray(children);

  if (reducedMotion) {
    return <div className={className}>{array}</div>;
  }

  return (
    <div className={className}>
      {array.map((child, index) => {
        const key = isValidElement(child)
          ? (child.key ?? `motion-stack-${String(index)}`)
          : `motion-stack-${String(index)}`;
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: distance }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.32,
              delay: delay + index * stagger,
              ease: [0.22, 0.61, 0.36, 1],
            }}
          >
            {child}
          </motion.div>
        );
      })}
    </div>
  );
}
