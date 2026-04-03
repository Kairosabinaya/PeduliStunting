/** ScrollProgress — fixed bar at top that fills as user scrolls through the page. */
"use client";

import { useEffect, useRef } from "react";
import { useGsap } from "@/hooks/use-gsap";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const { gsap, ScrollTrigger } = useGsap();

  useEffect(() => {
    if (!barRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${self.progress})`;
        }
      },
    });

    return () => {
      trigger.kill();
    };
  }, [gsap, ScrollTrigger]);

  return (
    <div
      ref={barRef}
      className="fixed top-16 left-0 right-0 h-[3px] bg-primary-600 z-40 origin-left"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
