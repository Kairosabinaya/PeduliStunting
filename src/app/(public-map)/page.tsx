import { redirect } from "next/navigation";

import { MAP_COPY } from "@/config/map";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/config/routes";

import { ErrorState } from "@/components/primitives/error-state";

import {
  buildMapFeatures,
  toFeatureCollection,
} from "@/components/features/map/map-data";
import { LandingMapShell } from "@/components/features/landing/landing-map-shell";
import { getCachedLandingMapData } from "@/lib/cached-map-data";
import { tryServerSession } from "@/lib/server-session";

/**
 * Root route `/`. Auth-conditional:
 *
 *  - Authenticated visitors are redirected to `DEFAULT_AUTHENTICATED_ROUTE`
 *    (`/map` — the interactive choropleth). They have already passed the
 *    marketing surface; sending them through it again would feel like a
 *    detour.
 *  - Unauthenticated visitors get the landing-before-login experience: a
 *    decorative map background + the shared `EdukasiScrollytelling` 11-ACT
 *    content. The CTAs lead to sign-up / sign-in.
 *
 * Previously this branching lived at `/map` itself, with `/` 308-redirected
 * to `/map`. User feedback was that the marketing should live at the root
 * so sharing a link to the landing reads as the canonical home URL, not as
 * a sub-route of the product.
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await tryServerSession();
  if (session !== null) {
    redirect(DEFAULT_AUTHENTICATED_ROUTE);
  }

  let landingData: Awaited<ReturnType<typeof getCachedLandingMapData>>;
  try {
    landingData = await getCachedLandingMapData();
  } catch (error) {
    return (
      <FullscreenError
        title="Tidak bisa memuat data peta"
        description={
          error instanceof Error ? error.message : "Penyebab tidak diketahui."
        }
      />
    );
  }

  const features = buildMapFeatures({
    regions: landingData.regions,
    boundaries: landingData.boundaries,
    indicators: landingData.indicators,
    predictions: [],
  });
  const featureCollection = toFeatureCollection(features);

  if (featureCollection.features.length === 0) {
    return (
      <FullscreenError
        title={MAP_COPY.noBoundariesTitle}
        description={MAP_COPY.noBoundariesDescription}
      />
    );
  }

  return (
    <LandingMapShell
      regions={landingData.regions}
      featureCollection={featureCollection}
      bounds={landingData.bounds}
      year={landingData.year}
    />
  );
}

function FullscreenError({
  title,
  description,
}: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center bg-background p-6">
      <ErrorState
        title={title}
        description={description}
        className="max-w-md"
      />
    </div>
  );
}
