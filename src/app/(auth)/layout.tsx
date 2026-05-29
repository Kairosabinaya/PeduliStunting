import type { ReactNode } from "react";

import { FloatingHeader } from "@/components/navigation/floating-header";
import { LandingMapBackground } from "@/components/features/landing/landing-map-background";
import {
  buildMapFeatures,
  toFeatureCollection,
} from "@/components/features/map/map-data";
import { getCachedLandingMapData } from "@/lib/cached-map-data";

/**
 * Marketing auth shell — sign-in, sign-up, reset-password — rendered "on top
 * of" the same map background as the landing-before-login surface. The form
 * sits in a `glass-panel-strong` card centered over a static (no scroll-
 * link) variant of the map so users feel they are already inside the
 * product, not on a sales page that links to the product.
 *
 * Sign-up uses a wider card via `data-auth-wide` because the form has the
 * avatar uploader + double-column display. Other pages stay narrow.
 *
 * `check-email` and `update-password` live in the sibling `(auth-fn)` group
 * with a plainer layout — see that layout's docstring for the rationale.
 */
interface AuthLayoutProps {
  readonly children: ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const landingData = await getCachedLandingMapData();
  const features = buildMapFeatures({
    regions: landingData.regions,
    boundaries: landingData.boundaries,
    indicators: landingData.indicators,
    predictions: [],
  });
  const featureCollection = toFeatureCollection(features);

  return (
    <div className="relative isolate min-h-dvh">
      <LandingMapBackground
        regions={landingData.regions}
        featureCollection={featureCollection}
        bounds={landingData.bounds}
        year={landingData.year}
        staticMode
      />
      <FloatingHeader session={null} />
      <main className="pt-safe-4 relative z-elevated grid min-h-dvh place-items-center px-4 pb-12">
        <div className="glass-panel-strong w-full max-w-md rounded-3xl p-6 md:p-10 [&:has([data-auth-wide])]:max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}
