"use client";

/**
 * Client-side composition layer for /map. Receives every dataset slice
 * from the server (already cached), then drives the entire interactive
 * experience from `useMapState()`. No router calls, no RSC roundtrips —
 * year/source/wilayah switches resolve in a single React render.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FeatureCollection, Geometry } from "geojson";

import type { ModelPredictionDto } from "@/application/model/dtos";
import type { RegionDto, RegionIndicatorsDto } from "@/application/region/dtos";
import {
  BottomSheet,
  type BottomSheetHandle,
} from "@/components/primitives/bottom-sheet";
import { EmptyState } from "@/components/primitives/empty-state";
import { MAP_COPY, MAP_SHEET_COPY, SHEET_SNAPS } from "@/config/map";
import { SUPPORTED_YEARS, type SupportedYear } from "@/config/years";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/lib/use-media-query";

import {
  computeRegionalSummary,
  findSiblingWithDataForYear,
  rankRegionByPrevalence,
  type MapFeatureProperties,
} from "./map-data";
import { AccountMenuPanel } from "./account-menu-panel";
import { MapCanvas } from "./map-canvas";
import { MapHeader } from "./map-header";
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
  /** Display name resolved from profile or auth. Powers the avatar initials. */
  readonly displayName: string | null;
  /** Session email used as the fallback identity surface. */
  readonly email: string | null;
}

export function MapShell({
  regions,
  featureCollectionsByYear,
  indicatorsByYear,
  predictionsByYear,
  defaultModel,
  predictedAvailable,
  bounds,
  displayName,
  email,
}: MapShellProps) {
  const { tahun, sumber, wilayah, isInteracting } = useMapState();
  // `accountOpen` swaps the bottom-sheet content from the map summary/
  // detail surface to the account menu. The mobile avatar tap toggles
  // this; the menu's own actions clear it on dismiss.
  const [accountOpen, setAccountOpen] = useState<boolean>(false);
  const sheetRef = useRef<BottomSheetHandle | null>(null);

  const onAccountClick = useCallback(() => {
    // PURE state update — the matching sheet-snap effect below reacts to
    // `accountOpen` flipping. Putting `setSnapIndex` inside the updater
    // here would dispatch on BottomSheet during MapShell's render, which
    // React flags as "setState during render of a different component".
    setAccountOpen((prev) => !prev);
  }, []);

  const onMenuItemSelected = useCallback(() => {
    setAccountOpen(false);
    // Safe to call here because we're inside an event handler, not a
    // render path — the React error only fires for renders.
  }, []);

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

  // Drives the major layout switch: docked side panel on lg+, mobile-style
  // bottom sheet anywhere below. The hook returns `false` on the first
  // client paint to keep SSR markup deterministic, which means we ship the
  // mobile layout until React hydrates the actual media query. That's the
  // safer default because the sheet works at every viewport whereas the
  // docked panel assumes >=1024px of horizontal room.
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Mobile auto-snap orchestration. On desktop the sheet isn't mounted
  // (docked panel renders instead) so we early-return on every effect.
  //
  // Account menu: opening shoots the sheet to full (entire menu visible
  // without a drag); closing falls through to the other effects.
  useEffect(() => {
    if (isDesktop) return;
    if (accountOpen) sheetRef.current?.setSnapIndex(2);
  }, [accountOpen, isDesktop]);

  // Region selection (map click OR search pick) → snap to half so the
  // detail is immediately visible. Deselection (ocean click) → peek.
  // Skip while the account menu owns the sheet state.
  useEffect(() => {
    if (isDesktop || accountOpen) return;
    sheetRef.current?.setSnapIndex(wilayah ? 1 : 0);
  }, [accountOpen, isDesktop, wilayah]);

  // Any map interaction collapses the sheet so the user can see what
  // they're navigating. Also unconditionally closes the account menu —
  // tapping the map clearly means "I want the map view back". The
  // setState-in-effect here is intentional: the trigger is an external
  // signal (`isInteracting` flipping in response to a MapLibre event),
  // not a value we could derive synchronously from props.
  useEffect(() => {
    if (isDesktop || !isInteracting) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- external signal, see above
    setAccountOpen(false);
    sheetRef.current?.setSnapIndex(0);
  }, [isDesktop, isInteracting]);

  // A click on ocean (deselect) should also dismiss the account menu so
  // the user lands back on the national summary as they asked for.
  useEffect(() => {
    if (wilayah !== null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors external selection state
    setAccountOpen(false);
  }, [wilayah]);

  if (!featureCollection) {
    return null;
  }

  // Single overlay fade class — every floating widget reads this so they
  // disappear/reappear together during pan/zoom.
  const overlayFade = cn(
    "transition-opacity duration-200",
    isInteracting && "pointer-events-none opacity-0",
  );

  const detailContent =
    selectedRegion && displayRegion ? (
      <RegionDetailPopup
        region={displayRegion}
        tahun={tahun}
        source={effectiveSource}
        currentIndicator={currentIndicator}
        ranking={ranking}
        history={mergedHistory}
        predictionHistory={mergedPredictionHistory}
        variant={isDesktop ? "docked" : "sheet"}
        className="w-full"
      />
    ) : (
      <RegionalSummaryCard
        summary={summary}
        tahun={tahun}
        modelVersion={defaultModel?.version ?? null}
        variant={isDesktop ? "docked" : "sheet"}
        className="w-full"
      />
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
          regions={regions}
        />
      </div>

      <MapHeader
        regions={regions}
        displayName={displayName}
        email={email}
        accountOpen={accountOpen}
        onAccountClick={onAccountClick}
        hideYearRow={isDesktop}
      />

      {isDesktop ? (
        <>
          {/* Desktop docked panel: top-right summary/detail. Lives below
              the map header pill (which now anchors the top region), so
              `top-24` instead of `top-5`. */}
          <div
            className={cn(
              "pointer-events-none fixed right-6 top-24 z-20 flex w-[24rem]",
              overlayFade,
            )}
          >
            <div className="pointer-events-auto w-full">{detailContent}</div>
          </div>

          {/* Desktop bottom-left cluster: a single 20rem column —
              horizontal year picker on top, info card below. Matching
              widths make the stack read as one composed surface. */}
          <div
            className={cn(
              "pointer-events-none fixed bottom-6 left-6 z-30 flex w-[20rem] flex-col items-stretch gap-3",
              overlayFade,
            )}
          >
            <VerticalYearRail
              orientation="horizontal"
              className="pointer-events-auto"
            />
            <MapInfoCard
              variant="floating"
              className="pointer-events-auto !w-full !max-w-none"
            />
          </div>
        </>
      ) : (
        // Mobile/tablet: the only floating widget below the header is the
        // sheet itself. The horizontal year picker now lives inside
        // `<MapHeader>` directly under the search bar.
        <BottomSheet
          ref={sheetRef}
          open
          onOpenChange={() => {}}
          snapPoints={[SHEET_SNAPS.peek, SHEET_SNAPS.half, SHEET_SNAPS.full]}
          title={
            accountOpen
              ? "Menu akun"
              : selectedRegion
                ? "Detail wilayah"
                : "Ringkasan nasional"
          }
          dragHandleAria={MAP_SHEET_COPY.dragHandleAria}
        >
          {accountOpen ? (
            <AccountMenuPanel
              displayName={displayName}
              email={email}
              onItemSelected={onMenuItemSelected}
            />
          ) : (
            <div className="space-y-5">
              {detailContent}
              <details className="rounded-xl border border-border bg-surface-muted/30 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-foreground">
                  {MAP_SHEET_COPY.inlineInfoSummary}
                </summary>
                <div className="mt-3">
                  <MapInfoCard variant="inline" />
                </div>
              </details>
            </div>
          )}
        </BottomSheet>
      )}

      {!predictedAvailable && sumber === "predicted" ? (
        <div
          className={cn(
            "pointer-events-none fixed inset-x-0 top-28 z-20 flex justify-center md:top-32",
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
