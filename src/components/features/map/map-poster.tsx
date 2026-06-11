import { ChoroplethMap } from "@/components/features/landing/scroll-choropleth/choropleth-map";

/**
 * Static SSR stand-in shown on /map until the WebGL canvas boots (user
 * intent or the idle timer in `MapShell`). Reuses the build-time inline-SVG
 * choropleth from the landing, so the visitor sees the national picture at
 * first paint with zero map-library JavaScript — this is the page's LCP.
 *
 * Rendered as a Server Component by `map/page.tsx` and slotted into the
 * client `MapShell` via the `poster` prop (client components cannot import
 * server components directly).
 */
export function MapPoster() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-background">
      <ChoroplethMap className="w-full max-w-5xl px-4" />
    </div>
  );
}
