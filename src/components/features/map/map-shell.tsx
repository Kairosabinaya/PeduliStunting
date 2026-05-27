"use client";

/**
 * Client-side composition layer for /map. Receives every dataset slice
 * from the server (already cached), then drives the entire interactive
 * experience from `useMapState()`. No router calls, no RSC roundtrips —
 * year/source/wilayah switches resolve in a single React render.
 */

import { useMemo } from "react";
import type { FeatureCollection, Geometry } from "geojson";

import type { ModelPredictionDto } from "@/application/model/dtos";
import type {
  RegionDto,
  RegionIndicatorsDto,
} from "@/application/region/dtos";
import { EmptyState } from "@/components/primitives/empty-state";
import { MAP_COPY } from "@/config/map";
import type { SupportedYear } from "@/config/years";
import { cn } from "@/lib/cn";

import {
  computeRegionalSummary,
  countByCategory,
  buildMapFeatures,
  findSiblingWithDataForYear,
  rankRegionByPrevalence,
  type MapFeatureProperties,
} from "./map-data";
import { MapCanvas } from "./map-canvas";
import { MapLegend } from "./map-legend";
import { OnboardingTrigger } from "./onboarding-trigger";
import { RegionalSummaryCard } from "./regional-summary-card";
import { RegionDetailPopup } from "./region-detail-popup";
import { StuntingInfoCard } from "./stunting-info-card";
import { VerticalYearRail } from "./vertical-year-rail";
import { useMapState } from "./map-state-context";

export interface MapShellProps {
  readonly regions: readonly RegionDto[];
  readonly featureCollectionsByYear: Record<
    SupportedYear,
    FeatureCollection<Geometry, MapFeatureProperties>
  >;
  readonly indicatorsByYear: Record<
    SupportedYear,
    readonly RegionIndicatorsDto[]
  >;
  readonly predictionsByYear: Record<
    SupportedYear,
    readonly ModelPredictionDto[]
  >;
  readonly defaultModel:
    | { readonly version: string; readonly name: string }
    | null;
  readonly predictedAvailable: boolean;
}

export function MapShell({
  regions,
  featureCollectionsByYear,
  indicatorsByYear,
  predictionsByYear,
  defaultModel,
  predictedAvailable,
}: MapShellProps) {
  const { tahun, sumber, wilayah } = useMapState();

  const effectiveSource =
    sumber === "predicted" && !predictedAvailable ? "actual" : sumber;

  const indicators = useMemo(
    () => indicatorsByYear[tahun] ?? [],
    [indicatorsByYear, tahun],
  );
  const predictions = useMemo(
    () => predictionsByYear[tahun] ?? [],
    [predictionsByYear, tahun],
  );
  const featureCollection = featureCollectionsByYear[tahun];

  // Reuse build for the count-by-category aggregation (cheap, in-memory).
  const features = useMemo(
    () =>
      buildMapFeatures({
        regions,
        boundaries: regions.map((r) => ({
          kodeBps: r.kodeBps,
          geometry: null,
          simplificationTolerance: null,
          source: null,
        })),
        indicators,
        predictions,
      }),
    [indicators, predictions, regions],
  );

  const counts = useMemo(
    () => countByCategory(features, effectiveSource),
    [effectiveSource, features],
  );

  const summary = useMemo(
    () => computeRegionalSummary(indicators),
    [indicators],
  );

  const selectedRegion = useMemo(() => {
    if (wilayah === null) return null;
    return regions.find((r) => r.kodeBps === wilayah) ?? null;
  }, [regions, wilayah]);

  // If the user-selected region has no data for the active year (typical for
  // a Papua-pemekaran code viewed in a pre-2022 year), look up the sibling
  // region carrying the actual historical observation. We then display the
  // sibling's provinsi + indicator while keeping `selectedRegion` as the
  // user-facing identifier (so the URL and category badge map to the click).
  const displayRegion = useMemo(() => {
    if (!selectedRegion) return null;
    const direct = indicators.find((i) => i.kodeBps === selectedRegion.kodeBps);
    if (direct) return selectedRegion;
    const sibling = findSiblingWithDataForYear(
      selectedRegion,
      regions,
      indicators,
    );
    return sibling ?? selectedRegion;
  }, [indicators, regions, selectedRegion]);

  const isHistoricalFallback =
    selectedRegion !== null &&
    displayRegion !== null &&
    displayRegion.kodeBps !== selectedRegion.kodeBps;

  const currentIndicator = useMemo(() => {
    if (!displayRegion) return null;
    return (
      indicators.find((i) => i.kodeBps === displayRegion.kodeBps) ?? null
    );
  }, [indicators, displayRegion]);

  const currentPrediction = useMemo(() => {
    if (!displayRegion) return null;
    return (
      predictions.find((p) => p.kodeBps === displayRegion.kodeBps) ?? null
    );
  }, [predictions, displayRegion]);

  const ranking = useMemo(() => {
    if (!displayRegion) return null;
    return rankRegionByPrevalence(indicators, displayRegion.kodeBps);
  }, [indicators, displayRegion]);

  const hasSelection = selectedRegion !== null;

  if (!featureCollection) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden">
        <MapCanvas
          featureCollection={featureCollection}
          dataKey={`${tahun}:${defaultModel?.version ?? "none"}`}
          source={effectiveSource}
          selectedKodeBps={wilayah}
        />
      </div>

      <div className="pointer-events-none fixed left-3 top-20 z-20 flex max-h-[calc(100dvh-6rem)] flex-col gap-3 md:left-6 md:top-24 md:max-w-[20rem]">
        <RegionalSummaryCard
          summary={summary}
          tahun={tahun}
          modelVersion={defaultModel?.version ?? null}
          className="pointer-events-auto"
        />
      </div>

      {!hasSelection ? (
        <div className="pointer-events-none fixed right-3 top-20 z-20 hidden max-w-[22rem] md:flex md:right-6 md:top-24">
          <StuntingInfoCard className="pointer-events-auto" />
        </div>
      ) : null}

      <div
        className={cn(
          "pointer-events-none fixed z-30 flex justify-center",
          "inset-x-3 bottom-20",
          "md:inset-x-auto md:bottom-auto md:left-auto md:right-6",
          hasSelection
            ? "md:top-[calc(100dvh-12rem)] md:-translate-y-full"
            : "md:top-1/2 md:-translate-y-1/2",
        )}
      >
        <VerticalYearRail className="pointer-events-auto" />
      </div>

      <div className="pointer-events-none fixed bottom-4 left-3 z-20 md:bottom-6 md:left-6">
        <OnboardingTrigger className="pointer-events-auto" />
      </div>

      <div className="pointer-events-none fixed bottom-4 right-3 z-20 md:bottom-6 md:right-6">
        <MapLegend
          defaultOpen={false}
          counts={counts}
          className="pointer-events-auto"
        />
      </div>

      {selectedRegion && displayRegion ? (
        <div className="pointer-events-none fixed inset-x-3 bottom-3 top-auto z-20 flex md:bottom-auto md:left-auto md:right-6 md:top-24 md:w-[24rem]">
          <RegionDetailPopup
            region={displayRegion}
            tahun={tahun}
            source={effectiveSource}
            predictedAvailable={predictedAvailable}
            currentIndicator={currentIndicator}
            currentPrediction={currentPrediction}
            ranking={ranking}
            isHistoricalFallback={isHistoricalFallback}
            originalSelection={selectedRegion}
            className="pointer-events-auto"
          />
        </div>
      ) : null}

      {!predictedAvailable && sumber === "predicted" ? (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-20 flex justify-center md:top-24">
          <EmptyState
            title={MAP_COPY.noPredictionsTitle}
            description={MAP_COPY.noPredictionsDescription}
            className="pointer-events-auto max-w-md"
          />
        </div>
      ) : null}
    </>
  );
}
