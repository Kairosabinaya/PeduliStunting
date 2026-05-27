import type { ModelPredictionDto } from "@/application/model/dtos";
import type { RegionIndicatorsDto } from "@/application/region/dtos";
import { MAP_COPY } from "@/config/map";
import { SUPPORTED_YEARS, type SupportedYear } from "@/config/years";

import { ErrorState } from "@/components/primitives/error-state";

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
import { requireServerSession } from "@/lib/server-session";

/**
 * Server "shell" for /map. Fetches every dataset up-front (all 4 years of
 * indicators + predictions, plus regions, boundaries, model metadata) and
 * bakes them into the initial HTML. From that point on, the page is fully
 * client-driven via {@link MapStateProvider}: year/source/wilayah changes
 * never hit the server, so interactions feel instant.
 *
 * Selection-specific history (chart + table) is lazy-loaded via the
 * `/api/region/[kodeBps]/history` route on demand.
 */
export const dynamic = "force-dynamic";

interface MapPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const rawSearch = await searchParams;
  const parsed = parseMapSearchParams(rawSearch);

  // Same identity-resolution path the global `(app)/layout.tsx` uses, but
  // run again here because /map's header lives inside `MapShell` (deeper
  // than the layout) and needs the resolved display name + email.
  const session = await requireServerSession();
  const profileResult = await fetchCurrentProfile(session.userId);
  const displayName =
    profileResult.ok && profileResult.value
      ? profileResult.value.displayName
      : session.email;

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
        // We pass the model version conditionally below. Default to empty
        // here; we'll re-fetch predictions per year only when the model is
        // available, to avoid wasting Supabase round-trips on first import.
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
      if (indicators) {
        indicatorsByYear[year] = indicators as readonly RegionIndicatorsDto[];
      } else {
        indicatorsByYear[year] = [];
      }
      predictionsByYear[year] = [];
    });

    // If a default model exists, fetch predictions for every year in parallel.
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

  // Compose feature collections per year so the client can swap source/year
  // without touching the network. Each FC reuses the same geometry refs;
  // only category properties change between years.
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
        displayName={displayName ?? null}
        email={session.email ?? null}
      />
    </MapStateProvider>
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
