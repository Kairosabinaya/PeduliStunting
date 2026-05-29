/**
 * Composer for the unauthenticated `/` (root) surface.
 *
 * Renders the shared 11-ACT `EdukasiScrollytelling` with `variant="landing"`
 * so the hero gets the Masuk / Daftar CTAs. The landing-before-login
 * experience and the authenticated `/edukasi` long-read stay linked by
 * source — there is no separate "landing chapter" set to maintain.
 *
 * Visually: a fullscreen `LandingMapBackground` sits behind the entire
 * scroll surface (scroll-linked `filter: blur() saturate()` so the map
 * clarifies as the user scrolls toward the closing CTA). The ACT sections
 * paint over the top in their own backgrounds; the map peeks through gaps
 * and provides the visceral hook of "saya sudah lihat petanya, sekarang
 * saya ingin tahu wilayah saya".
 */

import type { FeatureCollection, Geometry } from "geojson";

import type { RegionDto } from "@/application/region/dtos";
import { EdukasiScrollytelling } from "@/components/features/edukasi/edukasi-scrollytelling";

import type { MapFeatureProperties } from "@/components/features/map/map-data";

import { LandingMapBackground } from "./landing-map-background";

export interface LandingMapShellProps {
  readonly regions: readonly RegionDto[];
  readonly featureCollection: FeatureCollection<Geometry, MapFeatureProperties>;
  readonly bounds: readonly [
    readonly [number, number],
    readonly [number, number],
  ];
  readonly year: number;
}

export function LandingMapShell({
  regions,
  featureCollection,
  bounds,
  year,
}: LandingMapShellProps) {
  return (
    <div className="relative isolate min-h-dvh">
      <LandingMapBackground
        regions={regions}
        featureCollection={featureCollection}
        bounds={bounds}
        year={year}
      />
      <div className="relative z-elevated">
        <EdukasiScrollytelling variant="landing" />
      </div>
    </div>
  );
}
