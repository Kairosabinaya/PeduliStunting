/**
 * ACT III centrepiece — the signature scrubbed choropleth. Server component:
 * composes the warm dark band, the headline, the legend, and hands the
 * server-rendered {@link ChoroplethMap} to the client {@link ScrollChoropleth}
 * scrubber (which animates the reveal + counter).
 */

import Link from "next/link";

import {
  CHILDREN_AFFECTED_TOTAL,
  CHOROPLETH_COPY,
} from "@/config/landing-story";
import { buttonVariants } from "@/components/primitives/button";

import { ActSection } from "@/components/features/edukasi/primitives/act-section";
import { FootnoteRef } from "@/components/features/edukasi/primitives/footnote-ref";
import { HighlightWord } from "@/components/features/edukasi/primitives/highlight-word";

import { ChoroplethMap } from "./choropleth-map";
import { ScrollChoropleth } from "./scroll-choropleth";

const LEGEND_ITEMS = [
  {
    key: "rendah",
    swatch: "bg-ordinal-rendah",
    label: CHOROPLETH_COPY.legend.rendah,
  },
  {
    key: "sedang",
    swatch: "bg-ordinal-sedang",
    label: CHOROPLETH_COPY.legend.sedang,
  },
  {
    key: "tinggi",
    swatch: "bg-ordinal-tinggi",
    label: CHOROPLETH_COPY.legend.tinggi,
  },
] as const;

export function ChoroplethStorySection() {
  return (
    <ActSection
      id="act-choropleth"
      eyebrow={CHOROPLETH_COPY.eyebrow}
      dark
      maxWidth="wide"
    >
      <h2 className="section-headline text-balance">
        {CHOROPLETH_COPY.headlinePre}{" "}
        <HighlightWord variant="white">
          {CHOROPLETH_COPY.headlineHighlight}
        </HighlightWord>{" "}
        {CHOROPLETH_COPY.headlinePost}
      </h2>
      <p className="lead-paragraph mt-5 text-white/80">
        {CHOROPLETH_COPY.body}
        <FootnoteRef id={CHOROPLETH_COPY.bodyFootnoteId} />
      </p>

      <div className="mt-10">
        <ScrollChoropleth
          total={CHILDREN_AFFECTED_TOTAL}
          counterLabel={
            <span className="text-white/80">
              {CHOROPLETH_COPY.counterLabel}
              <FootnoteRef id={CHOROPLETH_COPY.counterFootnoteId} />
            </span>
          }
        >
          <ChoroplethMap />
        </ScrollChoropleth>
      </div>

      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <ul
          className="flex flex-wrap gap-x-6 gap-y-2"
          aria-label="Legenda kategori"
        >
          {LEGEND_ITEMS.map((item) => (
            <li
              key={item.key}
              className="flex items-center gap-2 text-sm text-white/80"
            >
              <span
                aria-hidden
                className={`inline-block h-3 w-3 rounded-sm ${item.swatch}`}
              />
              {item.label}
            </li>
          ))}
        </ul>
        <Link
          href={CHOROPLETH_COPY.exploreCta.href}
          className={buttonVariants({ variant: "primary", size: "lg" })}
        >
          {CHOROPLETH_COPY.exploreCta.label}
        </Link>
      </div>
    </ActSection>
  );
}
