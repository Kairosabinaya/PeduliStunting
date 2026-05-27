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
import type { RegionDto, RegionIndicatorsDto } from "@/application/region/dtos";
import { EmptyState } from "@/components/primitives/empty-state";
import { MAP_COPY } from "@/config/map";
import { SUPPORTED_YEARS, type SupportedYear } from "@/config/years";
import { cn } from "@/lib/cn";

import {
  computeRegionalSummary,
  findSiblingWithDataForYear,
  rankRegionByPrevalence,
  type MapFeatureProperties,
} from "./map-data";
import { MapCanvas } from "./map-canvas";
import { MapInfoCard } from "./map-info-card";
import { RegionalSummaryCard } from "./regional-summary-card";
import { RegionDetailPopup } from "./region-detail-popup";
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
  readonly defaultModel: {
    readonly version: string;
    readonly name: string;
  } | null;
  readonly predictedAvailable: boolean;
  /** Dataset-driven tight Indonesia bbox `[[west, south], [east, north]]`. */
  readonly bounds: readonly [
    readonly [number, number],
    readonly [number, number],
  ];
}

export function MapShell({
  regions,
  featureCollectionsByYear,
  indicatorsByYear,
  predictionsByYear,
  defaultModel,
  predictedAvailable,
  bounds,
}: MapShellProps) {
  const { tahun, sumber, wilayah, isInteracting } = useMapState();

  const effectiveSource =
    sumber === "predicted" && !predictedAvailable ? "actual" : sumber;

  const indicators = useMemo(
    () => indicatorsByYear[tahun] ?? [],
    [indicatorsByYear, tahun],
  );
  const featureCollection = featureCollectionsByYear[tahun];

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
    return indicators.find((i) => i.kodeBps === displayRegion.kodeBps) ?? null;
  }, [indicators, displayRegion]);

  const ranking = useMemo(() => {
    if (!displayRegion) return null;
    return rankRegionByPrevalence(indicators, displayRegion.kodeBps);
  }, [indicators, displayRegion]);

  /**
   * Cross-year history for the selected region. Walks each supported year
   * and picks the indicator/prediction row whose `kodeBps` belongs to ANY
   * physical sibling — i.e. the same kabupaten/kota under either the
   * pre- or post-pemekaran code. This unifies the Papua-pemekaran
   * timeline that used to look split (e.g. 9402 had 2021-2022 only, 9701
   * had 2023-2024 only; now both render as a single 4-year trajectory).
   */
  const siblingCodes = useMemo(() => {
    if (!selectedRegion) return new Set<string>();
    const name = selectedRegion.kabupatenKota.trim().toLowerCase();
    return new Set(
      regions
        .filter(
          (r) =>
            r.tipe === selectedRegion.tipe &&
            r.kabupatenKota.trim().toLowerCase() === name,
        )
        .map((r) => r.kodeBps),
    );
  }, [regions, selectedRegion]);

  const mergedHistory = useMemo(() => {
    if (siblingCodes.size === 0) return [] as readonly RegionIndicatorsDto[];
    const result: RegionIndicatorsDto[] = [];
    for (const year of SUPPORTED_YEARS) {
      const yearRows = indicatorsByYear[year] ?? [];
      const found = yearRows.find((i) => siblingCodes.has(i.kodeBps));
      if (found) result.push(found);
    }
    return result;
  }, [indicatorsByYear, siblingCodes]);

  const mergedPredictionHistory = useMemo(() => {
    if (siblingCodes.size === 0) return [] as readonly ModelPredictionDto[];
    const result: ModelPredictionDto[] = [];
    for (const year of SUPPORTED_YEARS) {
      const yearRows = predictionsByYear[year] ?? [];
      const found = yearRows.find((p) => siblingCodes.has(p.kodeBps));
      if (found) result.push(found);
    }
    return result;
  }, [predictionsByYear, siblingCodes]);

  if (!featureCollection) {
    return null;
  }

  // Single overlay fade class — every floating widget reads this so they
  // disappear/reappear together during pan/zoom (request #7).
  const overlayFade = cn(
    "transition-opacity duration-200",
    isInteracting && "pointer-events-none opacity-0",
  );

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden">
        <MapCanvas
          featureCollection={featureCollection}
          dataKey={`${tahun}:${defaultModel?.version ?? "none"}`}
          source={effectiveSource}
          selectedKodeBps={wilayah}
          bounds={bounds}
        />
      </div>

      {/*
        Merged top-right container: shows the national summary by default,
        swaps to the region detail panel when a kab/kota is selected.
        Y-aligned with the header (top-3 / md:top-5) so the right edge of
        the screen reads as a single horizontal band; content height is
        natural (no scrollbar) per user request.
      */}
      <div
        className={cn(
          "pointer-events-none fixed inset-x-3 top-3 z-20 flex md:inset-x-auto md:right-6 md:top-5 md:w-[24rem]",
          overlayFade,
        )}
      >
        {selectedRegion && displayRegion ? (
          <RegionDetailPopup
            region={displayRegion}
            tahun={tahun}
            source={effectiveSource}
            currentIndicator={currentIndicator}
            ranking={ranking}
            history={mergedHistory}
            predictionHistory={mergedPredictionHistory}
            isHistoricalFallback={isHistoricalFallback}
            originalSelection={selectedRegion}
            className="pointer-events-auto w-full"
          />
        ) : (
          <RegionalSummaryCard
            summary={summary}
            tahun={tahun}
            modelVersion={defaultModel?.version ?? null}
            className="pointer-events-auto w-full"
          />
        )}
      </div>

      {/*
        Bottom-left cluster: year rail on top, always-open tabbed info card
        (Kategori stunting + Panduan peta) below. No legend on the right.
      */}
      <div
        className={cn(
          "pointer-events-none fixed bottom-4 left-3 z-30 flex flex-col items-start gap-3 md:bottom-6 md:left-6",
          overlayFade,
        )}
      >
        <VerticalYearRail className="pointer-events-auto" />
        <MapInfoCard className="pointer-events-auto" />
      </div>

      {!predictedAvailable && sumber === "predicted" ? (
        <div
          className={cn(
            "pointer-events-none fixed inset-x-0 top-20 z-20 flex justify-center md:top-24",
            overlayFade,
          )}
        >
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
