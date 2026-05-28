"use client";

// Smooth-scroll wrapper for /edukasi. Lenis hijacks the wheel/touch
// scroll events and animates the scroll position with a custom RAF loop.
// We isolate it to the /edukasi route via this client provider so other
// routes (especially /map with its own gesture handlers) are not affected.
//
// Disabled when `prefers-reduced-motion: reduce` is set so vestibular
// sensitivity is respected (project guidelines §20). On touch devices Lenis also
// stays off — native momentum scroll is already smooth and Lenis tends to
// fight gesture handlers on mobile.

import { useEffect } from "react";
import Lenis from "lenis";

const LENIS_DURATION_SEC = 1.1;

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: LENIS_DURATION_SEC,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
