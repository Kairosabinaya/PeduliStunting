/** Scene 4 — "Kisah Nyata" — Storytelling emosional tentang seorang ibu dan anaknya. */
"use client";

import { useEffect, useRef } from "react";
import { useGsap } from "@/hooks/use-gsap";

const STORY_PARAGRAPHS = [
  "Di sebuah desa di Nusa Tenggara Timur, seorang ibu bernama Ina melahirkan anak pertamanya.",
  "Tanpa akses air bersih dan gizi yang cukup selama kehamilan, bayinya lahir dengan berat badan rendah.",
  "Di usia 2 tahun, anaknya tampak lebih kecil dari teman-temannya. Ia sering sakit dan sulit berkonsentrasi.",
  "Petugas Posyandu mengukur tinggi badannya dan menjelaskan: anaknya mengalami stunting.",
  "Tapi cerita ini belum berakhir. Dengan intervensi yang tepat dan dukungan dari komunitas, siklus ini bisa diputus.",
] as const;

export function Scene4() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { gsap, ScrollTrigger } = useGsap();

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".story-paragraph").forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.8,
            scrollTrigger: {
              trigger: el,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
            delay: i * 0.05,
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [gsap, ScrollTrigger]);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center px-4 py-24 bg-primary-900 relative overflow-hidden"
    >
      {/* Atmospheric background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary-400 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-accent-400 blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10 space-y-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-primary-400 text-center mb-8">
          Kisah Nyata
        </h2>

        {STORY_PARAGRAPHS.map((text, i) => (
          <div key={i} className="story-paragraph" style={{ opacity: 0 }}>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed text-center font-light">
              {text}
            </p>
            {i < STORY_PARAGRAPHS.length - 1 && (
              <div className="flex justify-center mt-8">
                <div className="w-1 h-8 bg-primary-600/30 rounded-full" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
