import Link from "next/link";

import { MAP_BRIDGE_COPY } from "@/config/edukasi";
import { buttonVariants } from "@/components/primitives/button";

import { FadeInView } from "../primitives/fade-in-view";
import { HighlightWord } from "../primitives/highlight-word";

/**
 * ACT 10 — bridge ke peta nasional. Headline + paragraf + dua CTA, di atas
 * background TRANSPARAN sehingga `LandingMapBackground` (choropleth peta
 * Indonesia yang sudah ada di balik landing) muncul subtle di balik konten.
 * Itulah momen "peta hadir kembali" tepat sebelum CTA — user spec: peta
 * harus kelihatan di sini.
 *
 * Visual layer top to bottom:
 *  1. `LandingMapBackground` (root: choropleth peta, opacity ~0.35-0.5)
 *  2. Vignette atas — gradient `edu-night → transparent` (transisi halus
 *     dari ACT 9 dark band)
 *  3. Glass-panel content card (translucent supaya peta tetap nyembul tapi
 *     teks tetap readable)
 *  4. Vignette bawah — gradient `transparent → edu-night` (transisi ke
 *     ACT 11 closing dark)
 *
 * Tidak pakai `ActSection` karena ActSection memaksakan `bg-background`
 * yang akan menutupi peta. Inline section memberi kontrol penuh atas
 * layering + transparency.
 */
export function MapBridgeSection() {
  return (
    <section
      id="act-10"
      aria-labelledby="act-10-eyebrow"
      className="snap-act full-bleed relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden py-16 sm:py-20"
    >
      {/* Vignette atas: gradient dari edu-night → transparan. Memastikan
          tepi atas section tidak menabrak ujung dark band ACT 9 dengan
          potongan keras. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-edu-night to-transparent"
      />
      {/* Vignette bawah: gradient dari transparan → edu-night. Memuluskan
          transisi ke ACT 11 (Penutup) yang dimulai dengan band malam. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 bg-gradient-to-b from-transparent to-edu-night"
      />

      <div className="container relative z-10 mx-auto max-w-2xl px-4 sm:px-6">
        {/* Glass card: cukup translucent supaya peta tetap kelihatan tapi
            teks dan tombol punya kontras yang manusiawi. */}
        <div className="glass-panel rounded-3xl p-8 text-center sm:p-12">
          <FadeInView as="div">
            <p id="act-10-eyebrow" className="eyebrow mb-4">
              {MAP_BRIDGE_COPY.eyebrow}
            </p>
            <h2 className="section-headline text-balance text-foreground">
              <span>{MAP_BRIDGE_COPY.headlineLead}</span>{" "}
              <HighlightWord
                variant={MAP_BRIDGE_COPY.headlineHighlight.variant}
              >
                {MAP_BRIDGE_COPY.headlineHighlight.value}
              </HighlightWord>
              <span>{MAP_BRIDGE_COPY.headlineTail}</span>
            </h2>
            <p className="mt-6 text-base text-muted-foreground sm:text-lg">
              {MAP_BRIDGE_COPY.body}
            </p>
          </FadeInView>

          <FadeInView
            as="div"
            delayMs={120}
            className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center"
          >
            <Link
              href={MAP_BRIDGE_COPY.ctaPrimary.href}
              className={buttonVariants({ variant: "primary", size: "lg" })}
            >
              {MAP_BRIDGE_COPY.ctaPrimary.label}
            </Link>
            <Link
              href={MAP_BRIDGE_COPY.ctaSecondary.href}
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              {MAP_BRIDGE_COPY.ctaSecondary.label}
            </Link>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
