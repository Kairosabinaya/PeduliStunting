// Hand-rolled SVG horizontal bar chart for the income-quintile disparity in
// ACT 4 (replaces the previous Recharts implementation, dropping that ~100 KB
// dependency entirely). Pure presentation — no hooks, no client APIs — so it
// renders inside the client `DeterminantSection` without its own "use client".
//
// The active bar is full-opacity; the rest dim. When `activeIndex` is null
// (reduced-motion / static fallback) every bar shows at full opacity. Fills
// come from the `--quintile-*` ramp so light/dark themes invert correctly and,
// on the landing, the warm scope re-points them automatically.

import { DETERMINANT_COPY } from "@/config/edukasi";
import {
  INCOME_QUINTILES,
  INCOME_QUINTILE_NATIONAL,
} from "@/data/edukasi/determinants";
import { cn } from "@/lib/cn";

export interface QuintileChartProps {
  /**
   * Index 0–4 of the highlighted quintile. When omitted or `null` every bar
   * shows at full opacity (static / reduced-motion state).
   */
  readonly activeIndex?: number | null;
}

const VIEW_WIDTH = 760;
const ROW_HEIGHT = 56;
const ROW_GAP = 16;
const LABEL_WIDTH = 150;
const VALUE_WIDTH = 64;
const TOP_PAD = 8;
const BOTTOM_PAD = 28;
/** X-axis domain max (%) — a touch above Q1 so the longest bar has headroom. */
const DOMAIN_MAX = 36;

const PLOT_WIDTH = VIEW_WIDTH - LABEL_WIDTH - VALUE_WIDTH;
const VIEW_HEIGHT =
  TOP_PAD +
  BOTTOM_PAD +
  INCOME_QUINTILES.length * ROW_HEIGHT +
  (INCOME_QUINTILES.length - 1) * ROW_GAP;

const percentFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/**
 * Per-quintile fill via Tailwind utilities (not an inline `var()` style):
 * compiled `fill-brand-*` classes resolve the scoped brand ramp reliably —
 * the same mechanism the choropleth uses — whereas `var()` inside an SVG
 * presentation attribute is ignored, and inside an inline `style` it did not
 * pick up the landing-scoped ramp consistently. Q1 (most vulnerable) = deepest,
 * Q5 (most prosperous) = lightest.
 */
const QUINTILE_FILL_CLASS: readonly string[] = [
  "fill-brand-700",
  "fill-brand-500",
  "fill-brand-400",
  "fill-brand-300",
  "fill-brand-200",
];

function barLength(prevalencePct: number): number {
  return (prevalencePct / DOMAIN_MAX) * PLOT_WIDTH;
}

/**
 * Horizontal bar chart of stunting prevalence by income quintile, with the
 * national-average reference line. Accessible via `role="img"` + an aria-label
 * summary and a visually-hidden data list.
 *
 * @example
 * ```tsx
 * <QuintileChart activeIndex={2} />
 * ```
 */
export function QuintileChart({ activeIndex = null }: QuintileChartProps) {
  const nationalX = LABEL_WIDTH + barLength(INCOME_QUINTILE_NATIONAL);

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${DETERMINANT_COPY.quintileTitle}. ${DETERMINANT_COPY.quintileNationalLabel}.`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* National-average reference line */}
        <line
          x1={nationalX}
          x2={nationalX}
          y1={TOP_PAD}
          y2={VIEW_HEIGHT - BOTTOM_PAD}
          stroke="rgb(var(--color-foreground))"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.5}
        />
        <text
          x={nationalX}
          y={VIEW_HEIGHT - 8}
          textAnchor="middle"
          className="fill-muted-foreground text-[11px]"
        >
          {DETERMINANT_COPY.quintileNationalLabel}
        </text>

        {INCOME_QUINTILES.map((quintile, index) => {
          const y = TOP_PAD + index * (ROW_HEIGHT + ROW_GAP);
          const width = barLength(quintile.prevalencePct);
          const active = activeIndex === null || activeIndex === index;
          return (
            <g
              key={quintile.id}
              className={cn(
                "transition-opacity duration-slow",
                active ? "opacity-100" : "opacity-35",
              )}
            >
              <text
                x={0}
                y={y + ROW_HEIGHT / 2}
                dominantBaseline="middle"
                className="fill-muted-foreground text-[13px]"
              >
                {quintile.label}
              </text>
              <rect
                x={LABEL_WIDTH}
                y={y + 8}
                width={Math.max(width, 2)}
                height={ROW_HEIGHT - 16}
                rx={6}
                className={QUINTILE_FILL_CLASS[index] ?? "fill-brand-500"}
              />
              <text
                x={LABEL_WIDTH + width + 10}
                y={y + ROW_HEIGHT / 2}
                dominantBaseline="middle"
                className="fill-foreground text-[14px] font-semibold"
              >
                {`${percentFormatter.format(quintile.prevalencePct)}%`}
              </text>
            </g>
          );
        })}
      </svg>
      <ul className="sr-only">
        {INCOME_QUINTILES.map((quintile) => (
          <li key={quintile.id}>
            {`${quintile.label}: ${percentFormatter.format(quintile.prevalencePct)}% — ${quintile.note}`}
          </li>
        ))}
      </ul>
    </figure>
  );
}
