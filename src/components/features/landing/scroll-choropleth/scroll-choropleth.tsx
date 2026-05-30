"use client";

/**
 * Client scrubber for the signature choropleth. Wraps the server-rendered
 * {@link ChoroplethMap} (passed as `children`) and the count-up counter, then
 * drives both from scroll position with GSAP ScrollTrigger.
 *
 * "use client": needs scroll-linked DOM animation (GSAP) + matchMedia.
 *
 * Behaviour:
 *  - Districts start ghosted (faint full map) and light up in severity order
 *    (Rendah → Sedang → Tinggi) as the section scrubs through the viewport.
 *  - The counter tallies 0 → `total` (the cited 4.482.340) on the same scrub.
 *  - GSAP is dynamic-imported and only after the section nears the viewport
 *    (IntersectionObserver), so it never enters the initial bundle and loads
 *    lazily below the fold.
 *  - `prefers-reduced-motion`: GSAP is never loaded; the server-rendered full
 *    map and the final counter value stay visible (no scrub, no flash).
 */

import { useEffect, useRef } from "react";

const idFormatter = new Intl.NumberFormat("id-ID");

export interface ScrollChoroplethProps {
  /** Cited national total the counter tallies up to (SSGI 2024). */
  readonly total: number;
  /** Children = the server-rendered <ChoroplethMap />. */
  readonly children: React.ReactNode;
  /** Label rendered under the counter value. */
  readonly counterLabel: React.ReactNode;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Order district nodes low → high severity (Rendah=0 … no-data=3). */
function orderByTier(root: HTMLElement): SVGPathElement[] {
  const nodes = Array.from(
    root.querySelectorAll<SVGPathElement>("[data-district]"),
  );
  return nodes.sort(
    (a, b) => Number(a.dataset.tier ?? "3") - Number(b.dataset.tier ?? "3"),
  );
}

export function ScrollChoropleth({
  total,
  children,
  counterLabel,
}: ScrollChoroplethProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const counterEl = counterRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return; // static full map + final counter

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    const setup = async (): Promise<void> => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !rootRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const districts = orderByTier(root);
        gsap.set(districts, { opacity: 0.07 });
        if (counterEl) counterEl.textContent = idFormatter.format(0);

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top 75%",
            end: "bottom 65%",
            scrub: 1,
          },
        });
        timeline.to(
          districts,
          {
            opacity: 1,
            ease: "none",
            stagger: { each: 0.6 / districts.length },
          },
          0,
        );
        const proxy = { value: 0 };
        timeline.to(
          proxy,
          {
            value: total,
            ease: "none",
            onUpdate: () => {
              if (counterEl) {
                counterEl.textContent = idFormatter.format(
                  Math.round(proxy.value),
                );
              }
            },
          },
          0,
        );
      }, root);

      ScrollTrigger.refresh();
    };

    // Defer the GSAP chunk until the section nears the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          void setup();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(root);

    return () => {
      cancelled = true;
      observer.disconnect();
      ctx?.revert();
    };
  }, [total]);

  return (
    <div
      ref={rootRef}
      className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]"
    >
      <div className="order-2 lg:order-1">{children}</div>
      <div className="order-1 lg:order-2">
        <p className="font-display text-5xl font-extrabold leading-none text-primary">
          <span ref={counterRef} className="stat-number tabular-nums">
            {idFormatter.format(total)}
          </span>
        </p>
        <p className="lead-paragraph mt-3">{counterLabel}</p>
      </div>
    </div>
  );
}
