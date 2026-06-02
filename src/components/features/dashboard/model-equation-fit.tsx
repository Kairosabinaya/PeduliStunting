"use client";

// Client component: the per-region fitted equation. Coefficients come from the
// loaded fit and change only on region/year selection. KaTeX is loaded with a
// dynamic import so its ~60KB lands in a deferred chunk (not the initial route
// JS); a monospace plain-text equation shows until it resolves.

import "katex/dist/katex.min.css";

import { useEffect, useState } from "react";

import { InfoHint } from "@/components/primitives/info-hint";
import { SIMULATOR_EQUATION } from "@/config/dashboard";
import { STUNTING_CATEGORIES } from "@/domain/region/value-objects/stunting-category";

interface KatexRenderer {
  readonly renderToString: (
    tex: string,
    options?: {
      readonly displayMode?: boolean;
      readonly throwOnError?: boolean;
    },
  ) => string;
}

export interface ModelEquationFitProps {
  readonly regionName: string;
  readonly tahun: number;
  readonly alfa1: number;
  readonly alfa2: number;
  /** Local slopes for this region-year, ordered X1..X20 (zeros kept). */
  readonly beta: readonly number[];
  readonly nActive: number | null;
}

const RENDAH = STUNTING_CATEGORIES[0];
const SEDANG = STUNTING_CATEGORIES[1];

function formatCoef(value: number): string {
  return value.toFixed(2);
}

/** KaTeX source for one cumulative-logit line — every X1..X20 term, zeros kept. */
function buildTex(
  category: string,
  intercept: number,
  beta: readonly number[],
): string {
  const terms = beta
    .map(
      (b, k) =>
        `${b >= 0 ? "+" : "-"}\\,${formatCoef(Math.abs(b))}\\,X_{${k + 1}}`,
    )
    .join(" ");
  return `\\operatorname{logit}\\,P(Y \\le \\text{${category}}) = ${formatCoef(intercept)} ${terms}`;
}

/** Plain-text fallback shown until the KaTeX chunk loads. */
function buildText(
  category: string,
  intercept: number,
  beta: readonly number[],
): string {
  const terms = beta
    .map((b, k) => `${b >= 0 ? "+" : "−"} ${formatCoef(Math.abs(b))} X${k + 1}`)
    .join(" ");
  return `logit P(Y ≤ ${category}) = ${formatCoef(intercept)} ${terms}`;
}

/**
 * The fitted regression equation for the selected region-year: two cumulative
 * logits (`Y≤Rendah`, `Y≤Sedang`) with the region's real intercepts and all 20
 * slopes filled in (zeros kept so the local variable selection is visible). The
 * slopes are identical across both lines (proportional odds); only the intercept
 * differs. Each line scrolls horizontally so the 20 terms never grow the card
 * tall. `Xk` are standardized predictor values.
 */
export function ModelEquationFit({
  regionName,
  tahun,
  alfa1,
  alfa2,
  beta,
  nActive,
}: ModelEquationFitProps) {
  const [katex, setKatex] = useState<KatexRenderer | null>(null);
  useEffect(() => {
    let active = true;
    void import("katex").then((mod) => {
      if (active) setKatex(mod.default);
    });
    return () => {
      active = false;
    };
  }, []);

  const lines = [
    { category: RENDAH, intercept: alfa1 },
    { category: SEDANG, intercept: alfa2 },
  ];
  const total = beta.length;
  const active = nActive ?? beta.filter((slope) => slope !== 0).length;

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-1.5">
        <h3 className="text-sm font-semibold text-foreground">
          {SIMULATOR_EQUATION.localTitle} — {regionName}, {tahun}
        </h3>
        <InfoHint label={SIMULATOR_EQUATION.localInfoLabel}>
          <p>{SIMULATOR_EQUATION.proportionalOddsNote}</p>
          <p className="mt-2">
            {SIMULATOR_EQUATION.standardizedNote}{" "}
            {SIMULATOR_EQUATION.nActiveNote(active, total)}
          </p>
        </InfoHint>
      </div>
      {/* `overflow-y-hidden` stops the horizontal scrollbar (the 20 terms never
          fit) from coercing a spurious vertical scrollbar; `p-4` leaves room for
          it. */}
      <div className="space-y-1.5 overflow-x-auto overflow-y-hidden rounded-lg border border-border bg-surface-muted/40 p-4">
        {lines.map(({ category, intercept }) => {
          const text = buildText(category, intercept, beta);
          // The plain-text equation is always in the DOM: it is the accessible
          // reading (KaTeX markup reads poorly) and the fallback before KaTeX
          // loads. When KaTeX is ready it becomes sr-only and the typeset
          // (aria-hidden) version shows.
          return (
            <div
              key={category}
              className="whitespace-nowrap text-sm text-foreground"
            >
              <span
                className={
                  katex === null
                    ? "font-mono text-xs text-muted-foreground"
                    : "sr-only"
                }
              >
                {text}
              </span>
              {katex !== null ? (
                <span
                  aria-hidden
                  dangerouslySetInnerHTML={{
                    __html: katex.renderToString(
                      buildTex(category, intercept, beta),
                      { displayMode: false, throwOnError: false },
                    ),
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
