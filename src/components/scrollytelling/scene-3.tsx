/** Scene 3 — "Peta Harapan dan Kekhawatiran" — Data disparitas antarwilayah Indonesia. */
"use client";

import { useEffect, useRef } from "react";
import { useGsap } from "@/hooks/use-gsap";
import { STUNTING_COLORS } from "@/lib/constants";

const REGION_DATA = [
  { name: "Bali & Jawa", rate: 15.2, color: STUNTING_COLORS.Rendah },
  { name: "Sumatera", rate: 20.1, color: STUNTING_COLORS.Sedang },
  { name: "Kalimantan", rate: 22.3, color: STUNTING_COLORS.Sedang },
  { name: "Sulawesi", rate: 27.5, color: STUNTING_COLORS.Tinggi },
  { name: "Nusa Tenggara", rate: 30.8, color: STUNTING_COLORS.Tinggi },
  { name: "Papua & Maluku", rate: 34.1, color: STUNTING_COLORS.Tinggi },
] as const;

const MAX_RATE = 40;

export function Scene3() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { gsap, ScrollTrigger } = useGsap();

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Staggered bar animation
      gsap.utils.toArray<HTMLElement>(".region-bar").forEach((el, i) => {
        gsap.fromTo(el,
          { scaleX: 0 },
          {
            scaleX: 1, duration: 0.6, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
            delay: i * 0.1,
          }
        );
      });

      // Fade in text
      gsap.fromTo(".scene3-narration",
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.8,
          scrollTrigger: { trigger: ".scene3-narration", start: "top 80%", toggleActions: "play none none reverse" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [gsap, ScrollTrigger]);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-primary-50/50"
    >
      <div className="max-w-3xl w-full">
        <h2 className="text-xl md:text-2xl font-bold text-center text-primary-700 mb-4">
          Peta Harapan dan Kekhawatiran
        </h2>
        <p className="scene3-narration text-center text-foreground/60 mb-12 max-w-lg mx-auto">
          Disparitas antarwilayah masih besar. Sementara Jawa terus membaik,
          Indonesia Timur masih berjuang.
        </p>

        {/* Bar chart */}
        <div className="space-y-4 mb-12">
          {REGION_DATA.map((r) => (
            <div key={r.name} className="flex items-center gap-4">
              <span className="text-sm font-medium w-36 text-right shrink-0 text-foreground/70">
                {r.name}
              </span>
              <div className="flex-1 h-8 bg-primary-100/50 rounded-full overflow-hidden">
                <div
                  className="region-bar h-full rounded-full flex items-center justify-end pr-3 origin-left"
                  style={{ width: `${(r.rate / MAX_RATE) * 100}%`, backgroundColor: r.color }}
                >
                  <span className="text-xs font-bold text-white">{r.rate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-xs text-foreground/50">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: STUNTING_COLORS.Rendah }} />
            Rendah (&lt;20%)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: STUNTING_COLORS.Sedang }} />
            Sedang (20-30%)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: STUNTING_COLORS.Tinggi }} />
            Tinggi (&gt;30%)
          </div>
        </div>
      </div>
    </section>
  );
}
