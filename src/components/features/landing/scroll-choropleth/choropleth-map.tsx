/**
 * Server-rendered SVG choropleth of the 514 kabupaten/kota, coloured by 2024
 * stunting severity. Pure presentation: no client JS, no hydration cost. The
 * scroll-reveal animation is layered on by the client {@link ScrollChoropleth}
 * wrapper, which manipulates these paths by `data-district` after mount.
 *
 * Accessibility: the SVG carries `role="img"` + an aria-label, and an adjacent
 * sr-only summary lists the per-severity district counts so screen-reader users
 * get the same takeaway without the visual.
 */

import { CHOROPLETH_COPY } from "@/config/landing-story";
import { cn } from "@/lib/cn";

import {
  CHOROPLETH,
  countBySeverity,
  type ChoroplethPath,
} from "./choropleth-data";

const SEVERITY_FILL: Record<NonNullable<ChoroplethPath["severity"]>, string> = {
  Rendah: "fill-ordinal-rendah",
  Sedang: "fill-ordinal-sedang",
  Tinggi: "fill-ordinal-tinggi",
};

/** Reveal tier index (low → high) consumed by the scrubber's stagger order. */
const SEVERITY_TIER: Record<NonNullable<ChoroplethPath["severity"]>, number> = {
  Rendah: 0,
  Sedang: 1,
  Tinggi: 2,
};

export function ChoroplethMap({ className }: { readonly className?: string }) {
  const { viewBox, paths } = CHOROPLETH;
  const counts = countBySeverity(paths);

  return (
    <div className={cn("relative w-full", className)}>
      <svg
        viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
        className="h-auto w-full"
        role="img"
        aria-label={CHOROPLETH_COPY.mapAriaLabel}
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          stroke="rgb(var(--color-background))"
          strokeWidth={0.4}
          strokeLinejoin="round"
        >
          {paths.map((path) => (
            <path
              key={path.kodeBps}
              d={path.d}
              data-district
              data-tier={
                path.severity === null ? 3 : SEVERITY_TIER[path.severity]
              }
              className={cn(
                path.severity === null
                  ? "fill-muted-foreground/40"
                  : SEVERITY_FILL[path.severity],
              )}
            >
              <title>
                {`${path.kabupatenKota} — ${
                  path.prevalence === null
                    ? "data tidak tersedia"
                    : `${path.prevalence.toLocaleString("id-ID")}%`
                }`}
              </title>
            </path>
          ))}
        </g>
      </svg>
      <p className="sr-only">
        {`Dari ${paths.length} wilayah: ${counts.Rendah} rendah, ${counts.Sedang} sedang, ${counts.Tinggi} tinggi` +
          (counts.tidakTersedia > 0
            ? `, ${counts.tidakTersedia} tanpa data`
            : "") +
          "."}
      </p>
    </div>
  );
}
