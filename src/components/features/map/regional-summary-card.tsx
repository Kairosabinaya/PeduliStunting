/**
 * Server Component: floating "Ringkasan Nasional" card overlayed on the map.
 *
 * Renders three things from the indicators already fetched by the page:
 *   1. Average `y1_prevalence` across the active year (one large stat).
 *   2. A 3-segment distribution bar coloured by ordinal category tokens.
 *   3. Total regions count + an optional model version badge.
 *
 * The card is a pure Server Component — no interactivity. Click handling
 * (year change, region selection) flows through other components.
 */

import { CATEGORY_BG_CLASS, MAP_SUMMARY_COPY } from "@/config/map";
import { cn } from "@/lib/cn";

import type { RegionalSummary } from "./map-data";

export type RegionalSummaryCardVariant = "docked" | "sheet";

export interface RegionalSummaryCardProps {
  readonly summary: RegionalSummary;
  readonly tahun: number;
  readonly modelVersion: string | null;
  /**
   * `docked` (default) renders the standalone glass card used on desktop.
   * `sheet` drops the chrome so the card sits cleanly inside the mobile
   * bottom-sheet content area without nesting glass surfaces.
   */
  readonly variant?: RegionalSummaryCardVariant;
  readonly className?: string;
}

export function RegionalSummaryCard({
  summary,
  tahun,
  modelVersion,
  variant = "docked",
  className,
}: RegionalSummaryCardProps) {
  const { averagePrevalence, distribution, total } = summary;
  const isSheet = variant === "sheet";
  return (
    <aside
      aria-labelledby="regional-summary-title"
      className={cn(
        isSheet ? "w-full" : "glass-panel w-[min(20rem,100%)] rounded-2xl p-4",
        className,
      )}
    >
      <header className="flex flex-col gap-0.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {MAP_SUMMARY_COPY.eyebrow}
        </p>
        <h2
          id="regional-summary-title"
          className="text-lg font-semibold text-foreground"
        >
          {MAP_SUMMARY_COPY.title}, tahun {tahun}
        </h2>
      </header>

      <dl className="mt-4 space-y-1">
        <dt className="text-xs font-medium text-muted-foreground">
          {MAP_SUMMARY_COPY.averagePrevalenceLabel}
        </dt>
        <dd className="stat-number text-3xl font-semibold text-foreground">
          {averagePrevalence !== null
            ? `${averagePrevalence.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
            : "—"}
        </dd>
      </dl>

      <section className="mt-4" aria-labelledby="regional-summary-distribution">
        <h3
          id="regional-summary-distribution"
          className="text-xs font-medium text-muted-foreground"
        >
          {MAP_SUMMARY_COPY.distributionTitle}
        </h3>
        <div
          aria-hidden
          className="mt-2 flex h-2 overflow-hidden rounded-full bg-surface-muted"
        >
          {distribution.map((slice) =>
            slice.percent > 0 ? (
              <span
                key={slice.category}
                className={cn("h-full", CATEGORY_BG_CLASS[slice.category])}
                style={{ width: `${slice.percent}%` }}
              />
            ) : null,
          )}
        </div>
        <ul className="mt-2 space-y-1 text-xs">
          {distribution.map((slice) => (
            <li
              key={slice.category}
              className="flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={cn(
                    "inline-block h-2.5 w-2.5 rounded-full",
                    CATEGORY_BG_CLASS[slice.category],
                  )}
                />
                <span className="text-foreground">{slice.category}</span>
              </span>
              <span className="font-mono tabular-nums text-muted-foreground">
                {slice.percent.toLocaleString("id-ID", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
                % ({slice.count})
              </span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3 text-xs">
        <span className="font-mono tabular-nums text-muted-foreground">
          {total.toLocaleString("id-ID")} {MAP_SUMMARY_COPY.totalRegionsLabel}
        </span>
        {modelVersion ? (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            {`${MAP_SUMMARY_COPY.modelBadgePrefix} ${modelVersion}`}
          </span>
        ) : null}
      </footer>
    </aside>
  );
}
