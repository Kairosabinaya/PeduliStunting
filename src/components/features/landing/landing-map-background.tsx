"use client";

/**
 * Fullscreen map backdrop for the landing-before-login surface. Mounts the
 * shared `MapCanvas` in decorative `mode="background"` and applies a scroll-
 * linked `filter: blur() saturate()` so the map starts subdued behind the
 * hero card and clarifies into a full reveal under the final CTA.
 *
 * Why `filter` and NOT `backdrop-filter`:
 *   - `filter` is composited on the wrapping layer once per transform, so
 *     animating it costs one rasterization per state change.
 *   - `backdrop-filter` re-rasterizes the entire stacking context behind
 *     the layer on every frame — unacceptable on mid-range Android given
 *     the choropleth has ~514 polygons and the basemap is a vector style.
 *
 * Reduced-motion users get a single static keyframe (no scroll subscription)
 * so the page stays predictable when easings are forbidden.
 */

import dynamic from "next/dynamic";
import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import type { FeatureCollection, Geometry } from "geojson";

import type { RegionDto } from "@/application/region/dtos";
import {
  LANDING_MAP_BLUR_KEYPOINTS,
  LANDING_MAP_OPACITY_KEYPOINTS,
  LANDING_MAP_SATURATE_KEYPOINTS,
  LANDING_REDUCED_MOTION_FALLBACK,
} from "@/config/landing-map";

import type { MapFeatureProperties } from "@/components/features/map/map-data";

// MapLibre needs `window` to mount its WebGL context, so the background map
// is loaded client-side only. The Promise-returning import lets Next code-
// split it into its own chunk shared with the interactive `/map` view.
const MapCanvas = dynamic(
  () => import("@/components/features/map/map-canvas").then((m) => m.MapCanvas),
  { ssr: false },
);

export interface LandingMapBackgroundProps {
  readonly featureCollection: FeatureCollection<Geometry, MapFeatureProperties>;
  readonly bounds: readonly [
    readonly [number, number],
    readonly [number, number],
  ];
  readonly regions: readonly RegionDto[];
  readonly year: number;
  /**
   * Skip the scroll-driven filter transition and render with a single static
   * keyframe instead. Pass `true` on surfaces where there is no meaningful
   * page scroll to bind to (auth shells) and the map should sit as a calm
   * backdrop rather than animate. Defaults to `false` (landing scrollytelling).
   */
  readonly staticMode?: boolean;
}

export function LandingMapBackground({
  featureCollection,
  bounds,
  regions,
  year,
  staticMode = false,
}: LandingMapBackgroundProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // `useScroll` without a target tracks document scroll. The landing renders
  // a column of full-viewport sections so the natural document scroll covers
  // the full hero → CTA range; 0 = top of hero, 1 = bottom of final CTA.
  const { scrollYProgress } = useScroll();
  const blur = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      LANDING_MAP_BLUR_KEYPOINTS.hero,
      LANDING_MAP_BLUR_KEYPOINTS.mid,
      LANDING_MAP_BLUR_KEYPOINTS.cta,
    ],
  );
  const saturate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      LANDING_MAP_SATURATE_KEYPOINTS.hero,
      LANDING_MAP_SATURATE_KEYPOINTS.mid,
      LANDING_MAP_SATURATE_KEYPOINTS.cta,
    ],
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      LANDING_MAP_OPACITY_KEYPOINTS.hero,
      LANDING_MAP_OPACITY_KEYPOINTS.mid,
      LANDING_MAP_OPACITY_KEYPOINTS.cta,
    ],
  );
  const animatedFilter = useMotionTemplate`blur(${blur}px) saturate(${saturate})`;

  const staticFilter = `blur(${LANDING_REDUCED_MOTION_FALLBACK.blur}px) saturate(${LANDING_REDUCED_MOTION_FALLBACK.saturate})`;
  const useStatic = reduceMotion || staticMode;

  return (
    <motion.div
      ref={wrapperRef}
      aria-hidden
      className="fixed inset-0 z-base overflow-hidden"
      style={
        useStatic
          ? {
              filter: staticFilter,
              opacity: LANDING_REDUCED_MOTION_FALLBACK.opacity,
            }
          : { filter: animatedFilter, opacity }
      }
    >
      <MapCanvas
        mode="background"
        featureCollection={featureCollection}
        dataKey={`landing-${year}`}
        source="actual"
        selectedKodeBps={null}
        bounds={bounds}
        regions={regions}
      />
    </motion.div>
  );
}
