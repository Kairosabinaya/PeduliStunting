/** Hook to initialize GSAP ScrollTrigger for scroll-bound animations. */
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

export function useGsap() {
  const ctx = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!registered) {
      gsap.registerPlugin(ScrollTrigger);
      registered = true;
    }

    return () => {
      ctx.current?.revert();
    };
  }, []);

  return { gsap, ScrollTrigger, ctx };
}
