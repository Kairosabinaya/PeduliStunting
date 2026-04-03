/** Scene 1 — "Satu Dari Empat" — Hook emosional dengan siluet anak-anak. */
"use client";

import { useEffect, useRef } from "react";
import { useGsap } from "@/hooks/use-gsap";

export function Scene1() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLParagraphElement>(null);
  const text2Ref = useRef<HTMLParagraphElement>(null);
  const child4Ref = useRef<SVGSVGElement>(null);
  const { gsap, ScrollTrigger } = useGsap();

  useEffect(() => {
    if (!sectionRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 1,
      },
    });

    if (text1Ref.current) {
      tl.fromTo(text1Ref.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1 });
    }
    if (child4Ref.current) {
      tl.to(child4Ref.current, { y: 20, opacity: 0.3, duration: 1 }, "-=0.5");
    }
    if (text2Ref.current) {
      tl.fromTo(text2Ref.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, "-=0.3");
    }

    return () => {
      tl.kill();
    };
  }, [gsap, ScrollTrigger]);

  const childSvg = (opacity = 1, ref?: React.Ref<SVGSVGElement>) => (
    <svg ref={ref} width="60" height="120" viewBox="0 0 60 120" className="transition-all" style={{ opacity }}>
      <circle cx="30" cy="20" r="14" fill="currentColor" />
      <rect x="18" y="36" width="24" height="40" rx="6" fill="currentColor" />
      <rect x="14" y="76" width="12" height="34" rx="4" fill="currentColor" />
      <rect x="34" y="76" width="12" height="34" rx="4" fill="currentColor" />
    </svg>
  );

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-gradient-to-b from-background to-primary-50"
    >
      {/* Siluet anak-anak */}
      <div className="flex items-end gap-6 md:gap-10 text-primary-300 mb-12">
        {childSvg(0.8)}
        {childSvg(0.8)}
        {childSvg(0.8)}
        {childSvg(0.5, child4Ref)}
      </div>

      {/* Narasi */}
      <div className="max-w-2xl text-center space-y-6">
        <p
          ref={text1Ref}
          className="text-2xl md:text-4xl font-bold text-foreground leading-tight"
          style={{ opacity: 0 }}
        >
          Di Indonesia, 1 dari 4 anak tumbuh tidak setinggi yang seharusnya.
        </p>
        <p
          ref={text2Ref}
          className="text-lg md:text-2xl text-foreground/60 font-light"
          style={{ opacity: 0 }}
        >
          Bukan karena genetik. Bukan karena takdir.
        </p>
      </div>
    </section>
  );
}
