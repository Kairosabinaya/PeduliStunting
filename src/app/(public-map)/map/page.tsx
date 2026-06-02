import type { ModelPredictionDto } from "@/application/model/dtos";
import type { RegionIndicatorsDto } from "@/application/region/dtos";
import { MAP_COPY } from "@/config/map";
import { SUPPORTED_YEARS, type SupportedYear } from "@/config/years";

import { ErrorState } from "@/components/primitives/error-state";

import { AiChatMount } from "@/components/features/ai/ai-chat-mount";
import {
  buildMapFeatures,
  toFeatureCollection,
} from "@/components/features/map/map-data";
import { MapShell } from "@/components/features/map/map-shell";
import { MapStateProvider } from "@/components/features/map/map-state-context";
import { parseMapSearchParams } from "@/components/features/map/map-search-params";
import {
  getCachedBoundaries,
  getCachedDefaultModel,
  getCachedIndicatorsByYear,
  getCachedPredictionsByYear,
  getCachedRegions,
  getCachedRegionsBounds,
} from "@/lib/cached-map-data";
import { fetchCurrentProfile } from "@/lib/account-cache";
import { tryServerSession } from "@/lib/server-session";

/**
 * `/map` — interactive choropleth, public. Renders for signed-in and signed-out
 * visitors alike: the reference tables it reads are anon-readable, so examiners
 * and the public can explore the map without an account. The shared header
 * shows Masuk/Daftar CTAs for guests and the avatar menu for members.
 */
export const dynamic = "force-dynamic";

interface MapPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const session = await tryServerSession();

  const rawSearch = await searchParams;
  const parsed = parseMapSearchParams(rawSearch);

  // Profile lookup is duplicated with `(app)/layout.tsx` for the rest of the
  // app shell. `/map` lives outside that group (so the layout never runs for
  // it) and `MapShell` still needs the resolved display name + email for the
  // avatar surface. Guests have no profile, so the avatar fields stay null.
  let displayName: string | null = null;
  let avatarUrl: string | null = null;
  if (session !== null) {
    const profileResult = await fetchCurrentProfile(session.userId);
    const profile = profileResult.ok ? profileResult.value : null;
    displayName = profile ? profile.displayName : session.email;
    avatarUrl = profile ? profile.avatarUrl : null;
  }

  let regions: Awaited<ReturnType<typeof getCachedRegions>>;
  let boundaries: Awaited<ReturnType<typeof getCachedBoundaries>>;
  let defaultModel: Awaited<ReturnType<typeof getCachedDefaultModel>>;
  let bounds: Awaited<ReturnType<typeof getCachedRegionsBounds>>;
  let indicatorsByYear: Record<SupportedYear, readonly RegionIndicatorsDto[]>;
  let predictionsByYear: Record<SupportedYear, readonly ModelPredictionDto[]>;
  try {
    const [
      regionsValue,
      boundariesValue,
      defaultModelValue,
      boundsValue,
      ...indicatorPredictionPairs
    ] = await Promise.all([
      getCachedRegions(),
      getCachedBoundaries(),
      getCachedDefaultModel(),
      getCachedRegionsBounds(),
      ...SUPPORTED_YEARS.flatMap((year) => [
        getCachedIndicatorsByYear(year),
        Promise.resolve([] as readonly ModelPredictionDto[]),
      ]),
    ]);
    regions = regionsValue;
    boundaries = boundariesValue;
    defaultModel = defaultModelValue;
    bounds = boundsValue;
    indicatorsByYear = {} as Record<
      SupportedYear,
      readonly RegionIndicatorsDto[]
    >;
    predictionsByYear = {} as Record<
      SupportedYear,
      readonly ModelPredictionDto[]
    >;
    SUPPORTED_YEARS.forEach((year, idx) => {
      const indicators = indicatorPredictionPairs[idx * 2];
      indicatorsByYear[year] =
        (indicators as readonly RegionIndicatorsDto[] | undefined) ?? [];
      predictionsByYear[year] = [];
    });

    const model = defaultModel;
    if (model) {
      const predictionResults = await Promise.all(
        SUPPORTED_YEARS.map((year) =>
          getCachedPredictionsByYear(model.version, year),
        ),
      );
      SUPPORTED_YEARS.forEach((year, idx) => {
        const preds = predictionResults[idx];
        if (preds) predictionsByYear[year] = preds;
      });
    }
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

  const featureCollectionsByYear: Record<
    SupportedYear,
    ReturnType<typeof toFeatureCollection>
  > = {} as Record<SupportedYear, ReturnType<typeof toFeatureCollection>>;
  for (const year of SUPPORTED_YEARS) {
    const indicators = indicatorsByYear[year] ?? [];
    const predictions = predictionsByYear[year] ?? [];
    const features = buildMapFeatures({
      regions,
      boundaries,
      indicators,
      predictions,
    });
    featureCollectionsByYear[year] = toFeatureCollection(features);
  }

  if (
    Object.values(featureCollectionsByYear).every(
      (fc) => fc.features.length === 0,
    )
  ) {
    return (
      <FullscreenError
        title={MAP_COPY.noBoundariesTitle}
        description={MAP_COPY.noBoundariesDescription}
      />
    );
  }

  const predictedAvailable = Object.values(predictionsByYear).some(
    (arr) => arr.length > 0,
  );

  return (
    <>
      <MapStateProvider
        initialTahun={parsed.tahun}
        initialSumber={parsed.sumber}
        initialWilayah={parsed.selection}
      >
        <MapShell
          regions={regions}
          featureCollectionsByYear={featureCollectionsByYear}
          indicatorsByYear={indicatorsByYear}
          predictionsByYear={predictionsByYear}
          defaultModel={defaultModel}
          predictedAvailable={predictedAvailable}
          bounds={bounds}
          displayName={displayName}
          email={session?.email ?? null}
          avatarUrl={avatarUrl}
        />
      </MapStateProvider>
      <AiChatMount
        pageId="map"
        kodeBps={parsed.selection ?? undefined}
        tahun={parsed.tahun}
      />
    </>
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
