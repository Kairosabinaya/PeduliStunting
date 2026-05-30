import Link from "next/link";

import { CHOROPLETH } from "@/components/features/landing/scroll-choropleth/choropleth-data";
import { ChoroplethMap } from "@/components/features/landing/scroll-choropleth/choropleth-map";
import { buttonVariants } from "@/components/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { DASHBOARD_CHOROPLETH } from "@/config/dashboard";
import { CATEGORY_BG_CLASS, CATEGORY_ORDER } from "@/config/map";
import { cn } from "@/lib/cn";

/**
 * Static (build-time SVG) choropleth of stunting severity, reusing the landing
 * map artefact. Year control lives on the now-public interactive `/map`, linked
 * prominently, so the dashboard avoids shipping a second MapLibre canvas
 * (ADR-0002 / the JS budget).
 */
export function DashboardChoropleth() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{DASHBOARD_CHOROPLETH.title}</CardTitle>
        <CardDescription>{DASHBOARD_CHOROPLETH.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChoroplethMap />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ul className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {CATEGORY_ORDER.map((category) => (
              <li key={category} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className={cn(
                    "inline-block size-3 rounded-full",
                    CATEGORY_BG_CLASS[category],
                  )}
                />
                {category}
              </li>
            ))}
            <li className="text-muted-foreground">Tahun {CHOROPLETH.year}</li>
          </ul>
          <Link
            href="/map"
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            {DASHBOARD_CHOROPLETH.openMapLabel}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
