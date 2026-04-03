/** Scene 5 — "Perubahan Dimulai dari Data" — CTA dengan transisi gelap ke terang. */
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useGsap } from "@/hooks/use-gsap";

const CTA_LINKS = [
  { href: "/peta", label: "Jelajahi Peta", primary: true },
  { href: "/dashboard/simulasi", label: "Coba Simulasi", primary: false },
  { href: "/edukasi", label: "Mulai Belajar", primary: false },
] as const;

export function Scene5() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { gsap, ScrollTrigger } = useGsap();

  useEffect(() => {
    if (!sectionRef.current || !overlayRef.current) return;

    const ctx = gsap.context(() => {
      // Dark-to-light overlay transition
      gsap.to(overlayRef.current, {
        opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
          end: "top 20%",
          scrub: 1,
        },
      });

      // Text and buttons fade in
      gsap.fromTo(".cta-text",
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.8,
          scrollTrigger: { trigger: ".cta-text", start: "top 75%", toggleActions: "play none none reverse" },
        }
      );

      gsap.utils.toArray<HTMLElement>(".cta-button").forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.5,
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
            delay: i * 0.15,
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [gsap, ScrollTrigger]);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center px-4 py-24 relative bg-gradient-to-b from-background to-primary-50"
    >
      {/* Dark overlay that fades out */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-primary-900 z-10 pointer-events-none"
        style={{ opacity: 1 }}
      />

      <div className="max-w-2xl mx-auto text-center relative z-20">
        <div className="cta-text space-y-4 mb-12" style={{ opacity: 0 }}>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Stunting bisa dicegah.
          </h2>
          <p className="text-xl md:text-2xl text-foreground/60 font-light">
            Langkah pertama adalah memahami data.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {CTA_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`cta-button inline-block px-8 py-3 rounded-lg text-base font-medium transition-colors ${
                link.primary
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "border border-primary-300 text-primary-700 hover:bg-primary-50"
              }`}
              style={{ opacity: 0 }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
