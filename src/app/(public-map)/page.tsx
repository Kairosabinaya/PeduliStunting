import type { Metadata } from "next";
import { Suspense } from "react";

import { LANDING_DESCRIPTION } from "@/config/seo";
import { LandingShell } from "@/components/features/landing/landing-shell";
import { SignedOutToast } from "@/components/navigation/signed-out-toast";

export const metadata: Metadata = {
  description: LANDING_DESCRIPTION,
};

/**
 * Root route `/` — the universal home. Renders the landing scroll story for
 * every visitor, signed in or not. The previous behaviour redirected
 * authenticated users to `/map`; that detour was removed so `/` is the single
 * canonical home and the educational scroll story (formerly the standalone
 * `/edukasi` route, now folded into the landing) stays reachable to everyone.
 *
 * No data fetch happens here: the signature map moment is the build-time
 * inline-SVG choropleth, and the interactive MapLibre map lives one click away
 * at `/map`. Keeping the landing free of the always-on canvas plus its ~3 MB
 * boundary fetch is what holds the Slow-3G LCP and initial-JS budgets.
 */
export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <SignedOutToast />
      </Suspense>
      <LandingShell />
    </>
  );
}
