"use client";

/**
 * Client-side composition layer for /map. Receives every dataset slice
 * from the server (already cached), then drives the entire interactive
 * experience from `useMapState()`. No router calls, no RSC roundtrips —
 * year/source/wilayah switches resolve in a single React render.
 */

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FeatureCollection, Geometry } from "geojson";

import type { ModelPredictionDto } from "@/application/model/dtos";
import type {
  RegionBoundaryDto,
  RegionDto,
  RegionIndicatorsDto,
} from "@/application/region/dtos";
import {
  BottomSheet,
  type BottomSheetHandle,
} from "@/components/primitives/bottom-sheet";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import {
  MAP_BOOT_IDLE_DELAY_MS,
  MAP_BOUNDARIES_ENDPOINT,
  MAP_COPY,
  MAP_SHEET_COPY,
  SHEET_SNAPS,
} from "@/config/map";
import { SUPPORTED_YEARS, type SupportedYear } from "@/config/years";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/lib/use-media-query";

import {
  buildMapFeatures,
  computeRegionalSummary,
  findSiblingWithDataForYear,
  rankRegionByPrevalence,
  toFeatureCollection,
  type MapFeatureProperties,
} from "./map-data";
import { AccountMenuPanel } from "./account-menu-panel";
import { MapHeader } from "./map-header";
import { MapInfoCard } from "./map-info-card";
import { RegionalSummaryCard } from "./regional-summary-card";
import { RegionDetailPopup } from "./region-detail-popup";
import { VerticalYearRail } from "./vertical-year-rail";
import { useMapState } from "./map-state-context";

// Code-split MapLibre GL (and its CSS) out of the route's initial bundle:
// the canvas only mounts after the deferred boot, so its ~200 KB chunk must
// not compete with first paint. SSR is off because the poster IS the SSR
// representation of the map.
const MapCanvasInteractive = dynamic(
  () =>
    import("./map-canvas-interactive").then(
      (module) => module.MapCanvasInteractive,
    ),
  { ssr: false },
);

export interface MapShellProps {
  readonly regions: readonly RegionDto[];
  /**
   * Static SSR stand-in (the build-time SVG choropleth) rendered until the
   * WebGL canvas boots. Passed as a node because `MapPoster` is a Server
   * Component that a client file cannot import.
   */
  readonly poster: React.ReactNode;
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
  /** Profile avatar URL. Null falls the avatar back to initials. */
  readonly avatarUrl: string | null;
}

export function MapShell({
  regions,
  poster,
  indicatorsByYear,
  predictionsByYear,
  defaultModel,
  predictedAvailable,
  bounds,
  displayName,
  email,
  avatarUrl,
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

  // Hybrid deferred boot: the static poster is the first paint; the WebGL
  // canvas (MapLibre + geometry fetch + tessellation) only starts on the
  // first user intent OR after an idle delay. This keeps the heavy boot out
  // of the critical loading window on throttled mobile devices.
  // A `?wilayah=` deep link boots immediately (lazy initial state) so the
  // auto-zoom still lands; later selections always involve a pointer or
  // keyboard event, which the intent listeners below already cover.
  const [mapBoot, setMapBoot] = useState<boolean>(() => wilayah !== null);
  useEffect(() => {
    if (mapBoot) return;
    const boot = () => setMapBoot(true);
    const intentEvents = [
      "pointerdown",
      "keydown",
      "wheel",
      "touchstart",
    ] as const;
    for (const event of intentEvents) {
      window.addEventListener(event, boot, { once: true, passive: true });
    }
    const timer = window.setTimeout(boot, MAP_BOOT_IDLE_DELAY_MS);
    return () => {
      for (const event of intentEvents) {
        window.removeEventListener(event, boot);
      }
      window.clearTimeout(timer);
    };
  }, [mapBoot]);

  // Boundary geometry arrives once via a long-cached endpoint instead of
  // being inlined per year in the RSC payload (which made the /map document
  // ~1 MB transferred). Fetched only after boot; validated at the wire
  // boundary before entering the feature join.
  const [boundaries, setBoundaries] = useState<
    readonly RegionBoundaryDto[] | null
  >(null);
  const [boundariesFailed, setBoundariesFailed] = useState<boolean>(false);
  useEffect(() => {
    if (!mapBoot || boundaries !== null) return;
    let cancelled = false;
    fetch(MAP_BOUNDARIES_ENDPOINT)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(async (payload: unknown) => {
        if (cancelled) return;
        // Dynamic import: keeps Zod (and the schema) out of /map's initial
        // bundle — it only loads here, after the deferred map boot.
        const { regionBoundariesPayloadSchema } =
          await import("@/schemas/map-boundaries");
        if (cancelled) return;
        const rows = regionBoundariesPayloadSchema.parse(payload);
        setBoundaries(
          rows.map((row) => ({
            kodeBps: row.kodeBps,
            geometry: row.geometry ?? null,
            simplificationTolerance: row.simplificationTolerance,
            source: row.source,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setBoundariesFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [boundaries, mapBoot]);

  // Feature collections are joined on the client once the geometry arrives —
  // the same pure `buildMapFeatures` join the server used to run. All years
  // are built together (one memo, no render-time ref cache) so year switches
  // are instant; the work happens once, after the deferred boot, off the
  // critical loading path.
  const featureCollectionsByYear = useMemo(() => {
    if (boundaries === null) return null;
    const byYear = new Map<
      SupportedYear,
      FeatureCollection<Geometry, MapFeatureProperties>
    >();
    for (const year of SUPPORTED_YEARS) {
      const features = buildMapFeatures({
        regions,
        boundaries,
        indicators: indicatorsByYear[year] ?? [],
        predictions: predictionsByYear[year] ?? [],
      });
      byYear.set(year, toFeatureCollection(features));
    }
    return byYear;
  }, [boundaries, indicatorsByYear, predictionsByYear, regions]);
  const featureCollection = featureCollectionsByYear?.get(tahun) ?? null;

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
        {/* Poster first, canvas after: same stacking context, so the booted
            canvas paints over the poster (no z-index juggling). The poster
            stays mounted underneath as the instant fallback while MapLibre
            initialises; `aria-hidden` flips once the canvas takes over so
            assistive tech never reads the page's map twice. */}
        <div aria-hidden={featureCollection !== null ? true : undefined}>
          {poster}
        </div>
        {featureCollection !== null ? (
          <div className="absolute inset-0 animate-fade-in">
            <MapCanvasInteractive
              featureCollection={featureCollection}
              dataKey={`${tahun}:${defaultModel?.version ?? "none"}`}
              source={effectiveSource}
              selectedKodeBps={wilayah}
              bounds={bounds}
              regions={regions}
            />
          </div>
        ) : null}
        {boundariesFailed ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 p-6">
            <ErrorState
              title={MAP_COPY.noBoundariesTitle}
              description={MAP_COPY.noBoundariesDescription}
              className="max-w-md"
            />
          </div>
        ) : null}
      </div>

      <MapHeader
        regions={regions}
        displayName={displayName}
        email={email}
        avatarUrl={avatarUrl}
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
              avatarUrl={avatarUrl}
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
