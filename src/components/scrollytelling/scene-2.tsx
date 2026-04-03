/** Scene 2 — "Apa yang Terjadi di Dalam" — Edukasi tentang dampak stunting pada tubuh. */
"use client";

import { useEffect, useRef, useState } from "react";
import { useGsap } from "@/hooks/use-gsap";

const HOTSPOTS = [
  { label: "Otak", desc: "Perkembangan otak terhambat", top: "15%", left: "50%" },
  { label: "Tulang", desc: "Pertumbuhan tulang terganggu", top: "50%", left: "30%" },
  { label: "Imun", desc: "Sistem imun melemah", top: "65%", left: "70%" },
] as const;

export function Scene2() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [counterVal, setCounterVal] = useState(0);
  const { gsap, ScrollTrigger } = useGsap();

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Animate hotspots
      gsap.utils.toArray<HTMLElement>(".hotspot").forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, x: i % 2 === 0 ? -30 : 30 },
          {
            opacity: 1, x: 0, duration: 0.8,
            scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" },
          }
        );
      });

      // Animated counter
      const proxy = { val: 0 };
      gsap.to(proxy, {
        val: 21.5,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: counterRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        onUpdate: () => setCounterVal(proxy.val),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [gsap, ScrollTrigger]);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-white"
    >
      <div className="max-w-4xl w-full">
        <h2 className="text-xl md:text-2xl font-bold text-center text-primary-700 mb-12">
          Apa yang Terjadi di Dalam Tubuh?
        </h2>

        {/* Body illustration with hotspots */}
        <div className="relative mx-auto w-48 h-80 mb-12">
          {/* Simplified body outline */}
          <svg viewBox="0 0 120 200" className="w-full h-full text-primary-200">
            <ellipse cx="60" cy="30" rx="22" ry="26" fill="currentColor" />
            <rect x="35" y="58" width="50" height="70" rx="12" fill="currentColor" />
            <rect x="25" y="128" width="22" height="60" rx="8" fill="currentColor" />
            <rect x="73" y="128" width="22" height="60" rx="8" fill="currentColor" />
            <rect x="10" y="65" width="20" height="50" rx="6" fill="currentColor" />
            <rect x="90" y="65" width="20" height="50" rx="6" fill="currentColor" />
          </svg>

          {/* Hotspots */}
          {HOTSPOTS.map((h) => (
            <div
              key={h.label}
              className="hotspot absolute flex items-center gap-2"
              style={{ top: h.top, left: h.left, transform: "translate(-50%, -50%)" }}
            >
              <div className="w-3 h-3 rounded-full bg-accent-400 animate-pulse" />
              <div className="bg-white rounded-lg shadow-md px-3 py-2 text-xs whitespace-nowrap">
                <span className="font-semibold text-accent-500">{h.label}</span>
                <br />
                <span className="text-foreground/60">{h.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Counter */}
        <div className="text-center mb-8">
          <span ref={counterRef} className="text-5xl md:text-7xl font-bold text-accent-400">
            {counterVal.toFixed(1)}%
          </span>
          <p className="text-foreground/60 mt-2 text-lg">
            anak Indonesia mengalami stunting (2023)
          </p>
        </div>

        {/* Explanation */}
        <p className="text-center text-foreground/70 max-w-xl mx-auto leading-relaxed">
          Stunting adalah kondisi gagal tumbuh pada anak akibat kekurangan gizi kronis,
          terutama pada 1.000 hari pertama kehidupan. Dampaknya bukan hanya fisik —
          tetapi juga pada perkembangan otak dan daya tahan tubuh.
        </p>
      </div>
    </section>
  );
}
