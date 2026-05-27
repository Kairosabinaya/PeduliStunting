/**
 * Floating, collapsible legend for the choropleth's three ordinal classes.
 *
 * Uses native `<details>` for the disclosure pattern: zero JS, full keyboard
 * accessibility, and works fine inside Server Components.
 */

import { MAP_COPY, MAP_LEGEND, CATEGORY_FILL_CLASS } from "@/config/map";
import { cn } from "@/lib/cn";

export interface MapLegendProps {
  readonly className?: string;
  /**
   * Number of features in each category. When omitted the counts column is
   * hidden, so the legend stays useful before data has loaded.
   */
  readonly counts?: Readonly<
    Record<"Rendah" | "Sedang" | "Tinggi" | "tidak-tersedia", number>
  >;
  /** When true the disclosure is expanded by default. */
  readonly defaultOpen?: boolean;
}

export function MapLegend({
  className,
  counts,
  defaultOpen = true,
}: MapLegendProps) {
  return (
    <section aria-labelledby="map-legend-title" className={className}>
      <details
        open={defaultOpen}
        className="glass-panel group rounded-2xl"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        <span className="flex flex-col gap-0.5">
          <span id="map-legend-title" className="font-semibold text-foreground">
            {MAP_COPY.legendTitle}
          </span>
          <span className="text-xs text-muted-foreground">
            {MAP_COPY.legendDescription}
          </span>
        </span>
        <span
          aria-hidden
          className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-full w-full">
            <path
              d="M5 7l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </summary>
      <ul className="border-t border-border p-3 text-sm">
        {MAP_LEGEND.map((entry) => (
          <li key={entry.category} className="flex items-center gap-3 py-1">
            <span
              aria-hidden
              className={cn(
                "inline-block h-3 w-6 rounded-sm",
                fillToBgClass(entry.category),
              )}
            />
            <span className="flex-1 text-foreground">{entry.title}</span>
            {counts ? (
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {counts[entry.category].toLocaleString("id-ID")}
              </span>
            ) : null}
            <span className="sr-only">{entry.description}</span>
          </li>
        ))}
        {counts && counts["tidak-tersedia"] > 0 ? (
          <li className="flex items-center gap-3 border-t border-border pt-2">
            <span
              aria-hidden
              className="inline-block h-3 w-6 rounded-sm bg-muted"
            />
            <span className="flex-1 text-muted-foreground">
              Data tidak tersedia
            </span>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {counts["tidak-tersedia"].toLocaleString("id-ID")}
            </span>
          </li>
        ) : null}
      </ul>
      </details>
    </section>
  );
}

function fillToBgClass(category: "Rendah" | "Sedang" | "Tinggi"): string {
  return CATEGORY_FILL_CLASS[category].replace(/^fill-/, "bg-");
}
