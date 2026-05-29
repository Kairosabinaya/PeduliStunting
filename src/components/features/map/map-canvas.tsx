"use client";

/**
 * MapLibre-based choropleth canvas. Replaces the hand-rolled SVG renderer
 * (see ADR-0004 which supersedes ADR-0002). Why:
 *   - Real pan/zoom with snap-back to Indonesia when the user drifts off.
 *   - Vector tile basemap so the map reads as a world map, not a void.
 *   - GPU-accelerated fill rendering with smooth category transitions.
 *
 * The 514-region GeoJSON is fetched server-side, cached via
 * `unstable_cache` (see `src/lib/cached-map-data.ts`), and handed to this
 * client component as plain JSON. Tile basemap comes from OpenFreeMap
 * (free, no API key, vector tiles served from cloudfront).
 */

import "maplibre-gl/dist/maplibre-gl.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AttributionControl,
  Layer,
  Map,
  Popup,
  Source,
  type MapLayerMouseEvent,
  type MapRef,
} from "react-map-gl/maplibre";
import type { FeatureCollection, Geometry } from "geojson";
import type maplibregl from "maplibre-gl";
import type { ExpressionSpecification, LngLatBoundsLike } from "maplibre-gl";

import type { RegionDto } from "@/application/region/dtos";
import type { MapFeatureProperties } from "./map-data";

import { Badge } from "@/components/primitives/badge";
import { CATEGORY_BADGE_TONE, type MapSource } from "@/config/map";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/lib/use-media-query";

const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

/**
 * Padding (in CSS pixels) used when running `map.fitBounds(...)` against
 * the data-driven Indonesia bbox. Combined with the ~5% lat/lon padding
 * already baked into the bbox itself, this gives the viewport a clean
 * negative-space margin so glass panels overlap ocean, not landmass.
 */
const FIT_BOUNDS_PADDING_PX = 24;

/**
 * Pixel radius around the cursor used as a fallback hit-test when the
 * exact cursor pixel misses every polygon. Without this, Kepulauan Seribu,
 * Sabang, Maluku atolls, and other small islands are practically
 * unhoverable at country-level zoom — each one occupies fewer than two
 * pixels. 10px gives a 20×20 square hit area, generous enough to feel
 * forgiving but small enough not to "steal" hovers when the cursor sits
 * squarely inside a large neighbouring region.
 */
const HIT_TOLERANCE_PX = 10;

const REGION_SOURCE_ID = "regions";
const REGION_FILL_LAYER_ID = "regions-fill";
const REGION_BORDER_LAYER_ID = "regions-border";
const REGION_FOCUS_LAYER_ID = "regions-focus";
const REGION_HOVER_LAYER_ID = "regions-hover";

interface HoverTip {
  readonly kodeBps: string;
  readonly kabupatenKota: string;
  readonly provinsi: string;
  readonly tipe: "Kabupaten" | "Kota";
  readonly category: "Rendah" | "Sedang" | "Tinggi" | null;
  readonly prevalence: number | null;
  readonly lng: number;
  readonly lat: number;
}

export interface MapCanvasProps {
  readonly featureCollection: FeatureCollection<Geometry, MapFeatureProperties>;
  /**
   * Stable key that changes only when the underlying geometry/categories
   * change (i.e. user picks a different year or the dataset is re-imported).
   * Used to memoise `featureCollection` so that route navigations that only
   * touch selection (`?wilayah=`) do not trigger a MapLibre source re-upload
   * and full geometry re-tessellation — the chief reason the page felt
   * sluggish to click.
   */
  readonly dataKey: string;
  readonly source: MapSource;
  readonly selectedKodeBps: string | null;
  /**
   * Tight Indonesia bbox `[[west, south], [east, north]]` used both for the
   * initial camera framing and as the snap-back target when the user pans
   * the camera off Indonesia.
   */
  readonly bounds: readonly [
    readonly [number, number],
    readonly [number, number],
  ];
  /**
   * Master list of regions. Used only by the programmatic auto-zoom
   * effect so it can fall back to a sibling kodeBps when the user-
   * selected code has no geometry in the active-year FeatureCollection
   * (typical for Papua pemekaran codes viewed in a year they don't
   * exist in).
   */
  readonly regions: readonly RegionDto[];
  readonly className?: string;
  /**
   * Rendering mode. `"interactive"` (default) wires up the full pan/zoom,
   * click-to-select, hover popup, one-shot geolocation, snap-back, and
   * interaction-state callbacks. `"background"` renders the choropleth as a
   * decorative backdrop only: all user input bindings, programmatic snap-back,
   * geolocation prompt, and callbacks are disabled. Pick `"background"` for
   * landing-before-login and auth-page backgrounds so the same MapLibre
   * pipeline is reused without leaking interactivity into surfaces that
   * should not respond to clicks or wheel events.
   */
  readonly mode?: "interactive" | "background";
  /**
   * Selection callback fired on click (region or ocean-deselect) and on the
   * one-shot geolocation snap-in. Required in `"interactive"` mode; ignored
   * in `"background"` mode where no callbacks fire.
   */
  readonly onSelect?: (kodeBps: string | null) => void;
  /**
   * Fires `true` when the user begins a camera gesture (drag, wheel, pinch)
   * and `false` when the gesture ends. Programmatic camera moves
   * (`fitBounds`, `easeTo`) do NOT trigger this. Required in `"interactive"`
   * mode; ignored in `"background"` mode.
   */
  readonly onInteractionChange?: (interacting: boolean) => void;
}

/**
 * Compute a `[[west, south], [east, north]]` bbox from any GeoJSON Polygon /
 * MultiPolygon geometry by walking every leaf coordinate pair. Returns null
 * when the geometry has no usable coordinates (e.g. an empty MultiPolygon
 * from a bad import) so callers can skip the fitBounds gracefully.
 */
function computeFeatureBbox(
  geometry: Geometry,
): readonly [readonly [number, number], readonly [number, number]] | null {
  let minLng = Number.POSITIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLng = Number.NEGATIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;
  function visit(point: readonly number[]): void {
    const lng = point[0];
    const lat = point[1];
    if (typeof lng !== "number" || typeof lat !== "number") return;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  function walk(input: unknown): void {
    if (!Array.isArray(input) || input.length === 0) return;
    if (typeof input[0] === "number") {
      visit(input as readonly number[]);
      return;
    }
    for (const item of input) walk(item);
  }
  if ("coordinates" in geometry) {
    walk((geometry as { coordinates: unknown }).coordinates);
  }
  if (!Number.isFinite(minLng) || !Number.isFinite(maxLng)) return null;
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

// Reading CSS variables from JS requires getComputedStyle. We resolve once
// on mount and pass concrete `rgb(r g b)` strings to MapLibre because MapLibre
// does not understand `var(--…)`.
function resolveCategoryHexes(): {
  readonly rendah: string;
  readonly sedang: string;
  readonly tinggi: string;
  readonly border: string;
  readonly focus: string;
} {
  if (typeof window === "undefined") {
    return {
      rendah: "rgb(88 175 110)",
      sedang: "rgb(232 184 50)",
      tinggi: "rgb(210 70 65)",
      border: "rgba(255,255,255,0.85)",
      focus: "rgb(24 26 28)",
    };
  }
  const root = getComputedStyle(document.documentElement);
  const get = (name: string) => `rgb(${root.getPropertyValue(name).trim()})`;
  return {
    rendah: get("--color-ordinal-rendah"),
    sedang: get("--color-ordinal-sedang"),
    tinggi: get("--color-ordinal-tinggi"),
    border: "rgba(255, 255, 255, 0.85)",
    focus: get("--color-foreground"),
  };
}

export function MapCanvas({
  featureCollection,
  dataKey,
  source,
  selectedKodeBps,
  bounds,
  regions,
  className,
  mode = "interactive",
  onSelect,
  onInteractionChange,
}: MapCanvasProps) {
  const isInteractive = mode === "interactive";
  // Bounds are wrapped in a ref so the long-lived event listeners (onIdle,
  // onLoad fitBounds) always read the current value without re-binding on
  // every render — but the bounds change so rarely (only when regions
  // dataset changes) that even direct closure capture would be fine.
  const boundsRef = useRef(bounds);
  useEffect(() => {
    boundsRef.current = bounds;
  }, [bounds]);
  // Memoise the FeatureCollection reference by `dataKey`. The Server
  // Component re-creates the JSON on every render (selection changes too),
  // but MapLibre's `Source` re-tessellates on every fresh reference. We
  // only let the reference change when the actual geometry/category data
  // changes; selection/source-toggle navigations keep the same instance.
  // Intentionally exclude `featureCollection` from the deps array — that's
  // the whole point: ignore identity-only changes and only re-memo when the
  // semantic key changes.
  const stableFeatureCollection = useMemo(
    () => featureCollection,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see comment above
    [dataKey],
  );
  const mapRef = useRef<MapRef | null>(null);
  const [palette, setPalette] = useState(() => resolveCategoryHexes());
  const [hover, setHover] = useState<HoverTip | null>(null);
  // Touch-only devices (mobile, most tablets) get no hover preview — tap
  // directly opens the sheet, so a tooltip would just steal the first tap.
  // Hybrid devices (Surface, iPad with trackpad) report `hover: hover` and
  // keep the desktop behaviour.
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  // Tracks the most recent kodeBps we ran `fitBounds` against. Both the
  // click handler and the search-driven prop-change effect write to this
  // ref so they don't double-zoom on the same selection (click sets it
  // synchronously before the prop change reaches the effect).
  const zoomedKodeBpsRef = useRef<string | null>(null);
  /**
   * `mapReady` flips to `true` only after `<Map onLoad>` fires, guaranteeing
   * the underlying maplibre instance + style are fully initialised before we
   * bind hover/idle listeners. Previously the binding `useEffect` ran with
   * empty deps and could see a half-initialised `mapRef.current.getMap()`
   * (style not loaded → `queryRenderedFeatures` returned empty), which is
   * why the hover effect never appeared.
   */
  const [mapReady, setMapReady] = useState(false);
  // Ref so the long-lived mousemove handler always reads the latest `source`
  // prop without re-binding the listener on every render. Updated via effect
  // so we never write to `.current` during render (React strict mode rule).
  const sourceRef = useRef(source);
  useEffect(() => {
    sourceRef.current = source;
  }, [source]);

  useEffect(() => {
    // The initial state was computed against SSR fallbacks; once mounted we
    // sync against the real DOM. Subsequent updates flow via the
    // MutationObserver on data-theme. Synchronous setState here is the
    // documented escape hatch — we cannot read CSS variables during SSR and
    // there is no external store to subscribe to.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-shot hydration sync of CSS-variable-derived palette
    setPalette(resolveCategoryHexes());
    const observer = new MutationObserver(() => {
      setPalette(resolveCategoryHexes());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const fillPaint = useMemo(
    () => ({
      "fill-color": buildFillPaintFromPalette(source, palette),
      // Hover is driven entirely by MapLibre's `feature-state` (set via the
      // direct mousemove listener) so the visual change is GPU-only — no
      // React re-render between cursor moves. Selection still reads from
      // the React prop because it's a low-frequency change.
      "fill-opacity": [
        "case",
        ["==", ["get", "kodeBps"], selectedKodeBps ?? ""],
        1,
        ["boolean", ["feature-state", "hover"], false],
        1,
        0.82,
      ] as ExpressionSpecification,
    }),
    [palette, selectedKodeBps, source],
  );

  const borderPaint = useMemo(
    () => ({
      "line-color": palette.border,
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        3,
        0.3,
        6,
        0.6,
        9,
        1.2,
      ] as ExpressionSpecification,
    }),
    [palette.border],
  );

  const focusPaint = useMemo(
    () => ({
      "line-color": palette.focus,
      "line-width": 2.2,
    }),
    [palette.focus],
  );

  const focusFilter = useMemo<ExpressionSpecification>(
    () => ["==", ["get", "kodeBps"], selectedKodeBps ?? ""],
    [selectedKodeBps],
  );

  // Programmatic selection (e.g. from the header search bar) should pan +
  // zoom to the picked region just like a real click does. The click
  // handler writes `zoomedKodeBpsRef` synchronously before it dispatches
  // the state change, so this effect can detect "selection arrived from
  // somewhere other than a click" and run the fitBounds itself. Without
  // this, search-selected regions would only highlight; the camera would
  // stay on Indonesia and the user would have to scroll/hunt manually.
  useEffect(() => {
    if (!mapReady) return;
    if (selectedKodeBps === null) {
      zoomedKodeBpsRef.current = null;
      return;
    }
    if (zoomedKodeBpsRef.current === selectedKodeBps) return;
    const ref = mapRef.current;
    const map = ref?.getMap();
    if (!map) return;

    const features = stableFeatureCollection.features;
    let feature = features.find(
      (f) => f.properties?.kodeBps === selectedKodeBps,
    );
    if (!feature?.geometry) {
      // Selected code has no geometry in the active-year FC — typical when
      // the user searches a Papua-pemekaran code while a year predating
      // (or post-dating) the split is active. Fall back to a sibling
      // feature carrying the same kabupatenKota + tipe so the camera still
      // flies to the physical region.
      const selRegion = regions.find((r) => r.kodeBps === selectedKodeBps);
      if (selRegion) {
        feature = features.find(
          (f) =>
            f.geometry !== null &&
            f.properties?.tipe === selRegion.tipe &&
            f.properties?.kabupatenKota === selRegion.kabupatenKota,
        );
      }
    }
    if (!feature?.geometry) return;

    const bbox = computeFeatureBbox(feature.geometry as Geometry);
    if (!bbox) return;
    zoomedKodeBpsRef.current = selectedKodeBps;
    map.fitBounds(bbox as LngLatBoundsLike, {
      padding: 80,
      duration: 800,
      maxZoom: 8,
    });
  }, [mapReady, regions, selectedKodeBps, stableFeatureCollection]);

  const hoverStrokePaint = useMemo(
    () => ({
      "line-color": palette.focus,
      "line-width": 3,
      // Layer is mounted once for every feature; we toggle visibility via
      // `feature-state.hover` so MapLibre never has to swap a layer filter
      // (which would force a React render). Pure GPU paint update → no lag.
      "line-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1,
        0,
      ] as ExpressionSpecification,
    }),
    [palette.focus],
  );

  // Click → instant client state update. No router, no RSC.
  // Empty click (ocean / outside any region polygon) clears the selection so
  // the merged panel falls back to the national summary view. Region click
  // additionally eases the camera so the kab/kota fills a comfortable
  // portion of the viewport (Google Maps "tap-to-zoom" behaviour).
  const handleClick = useCallback(
    (event: MapLayerMouseEvent) => {
      // Background mode treats clicks as inert. We still register the
      // handler so `<Map>` props stay type-stable, but neither selection nor
      // camera movement should follow from a tap.
      if (!isInteractive) return;
      // Tiny features (Kepulauan Seribu, Sabang, atolls) are nearly
      // impossible to hit with a point query at low zoom. If the exact
      // cursor pixel missed every polygon, expand the hit-test to a small
      // box around the cursor and pick the first match before falling back
      // to the "ocean click → deselect" behaviour.
      let feature = event.features?.[0];
      if (!feature) {
        const p = event.point;
        const padded = event.target.queryRenderedFeatures(
          [
            [p.x - HIT_TOLERANCE_PX, p.y - HIT_TOLERANCE_PX],
            [p.x + HIT_TOLERANCE_PX, p.y + HIT_TOLERANCE_PX],
          ],
          { layers: [REGION_FILL_LAYER_ID] },
        );
        feature = padded[0];
      }
      if (!feature) {
        // Click landed on ocean / outside any region polygon. Deselect AND
        // ease the camera back to the dataset-derived Indonesia bbox so the
        // user "zooms out" with a single click rather than having to drag.
        onSelect?.(null);
        event.target.fitBounds(boundsRef.current as LngLatBoundsLike, {
          padding: FIT_BOUNDS_PADDING_PX,
          duration: 800,
        });
        return;
      }
      const kodeBps = feature.properties?.kodeBps;
      if (typeof kodeBps !== "string") return;
      // Mark this kodeBps as already-zoomed so the prop-change effect that
      // handles search-driven selections doesn't fire a second fitBounds
      // for the same target.
      zoomedKodeBpsRef.current = kodeBps;
      onSelect?.(kodeBps);
      if (feature.geometry) {
        const bbox = computeFeatureBbox(feature.geometry as Geometry);
        if (bbox) {
          event.target.fitBounds(bbox as LngLatBoundsLike, {
            padding: 80,
            duration: 800,
            // Cap zoom so a tiny kota (Sabang, Tual) doesn't slam the user
            // into street level; we want to show context too.
            maxZoom: 8,
          });
        }
      }
    },
    [isInteractive, onSelect],
  );

  /**
   * Theme-aware basemap paints, calibrated against Google Maps.
   *
   *   Light: land #f3f4f6, water #aecbfa, text #3c4043 (Material grays)
   *   Dark:  land #202124, water #0b1d2e, text #e8eaed
   *
   * Walks every layer in the positron style — `background` alone is not
   * enough because positron paints landuse/landcover/park/place layers on
   * top of it with their own colours (that's why Australia and other land
   * polygons stayed white in dark mode). We classify each layer by id +
   * type and force it into the active palette so the entire basemap reads
   * as a single coherent backdrop.
   */
  const applyBasemapPaints = useCallback((map: maplibregl.Map) => {
    const isDark = document.documentElement.dataset.theme === "dark";
    const palette = isDark
      ? {
          land: "#202124",
          water: "#0b1d2e",
          boundary: "#3c4043",
          text: "#e8eaed",
          textHalo: "#202124",
        }
      : {
          land: "#f3f4f6",
          water: "#aecbfa",
          boundary: "#dadce0",
          text: "#3c4043",
          textHalo: "#ffffff",
        };

    const style = map.getStyle();
    if (!style?.layers) return;

    const safeSet = (
      layerId: string,
      property: string,
      value: unknown,
    ): void => {
      try {
        if (!map.getLayer(layerId)) return;
        map.setPaintProperty(layerId, property, value);
      } catch {
        // tile style renames are tolerated; keep the default look for that layer.
      }
    };

    for (const layer of style.layers) {
      const id = layer.id;
      // Never touch our own choropleth/region layers.
      if (id.startsWith("regions-")) continue;

      const isWater = /water|sea|ocean|river|lake/i.test(id);
      const isBoundary = /boundary|border|admin/i.test(id);

      if (layer.type === "background") {
        safeSet(id, "background-color", palette.land);
      } else if (layer.type === "fill") {
        if (isWater) {
          safeSet(id, "fill-color", palette.water);
        } else {
          safeSet(id, "fill-color", palette.land);
        }
      } else if (layer.type === "line") {
        if (isWater) {
          safeSet(id, "line-color", palette.water);
        } else if (isBoundary) {
          safeSet(id, "line-color", palette.boundary);
        } else {
          // Roads/railways — keep them subtle in dark mode.
          safeSet(id, "line-color", palette.boundary);
        }
      } else if (layer.type === "symbol") {
        // Labels sitting OVER our choropleth fills (places, cities, country
        // names) get a hard white-on-dark-halo treatment so they remain
        // readable on the bold Google-palette greens/yellows/reds. Water
        // labels keep the theme-aware contrast so they don't clash with
        // the light-blue / deep-navy sea fills.
        if (isWater) {
          safeSet(id, "text-color", palette.text);
          safeSet(id, "text-halo-color", palette.textHalo);
          safeSet(id, "text-halo-width", 1.2);
        } else {
          safeSet(id, "text-color", "#ffffff");
          safeSet(id, "text-halo-color", "#1a1a1a");
          safeSet(id, "text-halo-width", 1.8);
        }
      }
    }
  }, []);

  /**
   * Hover state + snap-back via direct MapLibre `.on()` bindings.
   *
   * Gated by `mapReady` so the listeners only bind AFTER `<Map onLoad>` has
   * fired. Before that, `queryRenderedFeatures` returns empty (style not
   * loaded) and `setFeatureState` is a no-op — both silently swallow the
   * hover intent, which is what made the effect invisible in iter 7.
   */
  useEffect(() => {
    if (!mapReady) return;
    // Background mode renders the choropleth as a decorative backdrop only:
    // no hover popup, no snap-back, no interaction-state plumbing. Skipping
    // the entire effect avoids paying for `setFeatureState` writes and
    // `requestAnimationFrame` loops that nobody will read.
    if (!isInteractive) return;
    const ref = mapRef.current;
    const map = ref?.getMap();
    if (!map) return;

    let hoveredId: string | number | null = null;
    // Throttle the React `setHover` (tooltip position) to one update per
    // animation frame. Mousemove can fire 60-120Hz which previously caused
    // a re-render storm — the popup visibly trailed the cursor. Feature-
    // state updates stay synchronous because they're cheap GPU writes.
    let pendingTip: HoverTip | null = null;
    let pendingClear = false;
    let rafId: number | null = null;
    const flushTip = () => {
      rafId = null;
      if (pendingClear) {
        setHover(null);
        pendingClear = false;
        pendingTip = null;
      } else if (pendingTip !== null) {
        setHover(pendingTip);
        pendingTip = null;
      }
    };
    const scheduleTip = (next: HoverTip | null) => {
      if (next === null) {
        pendingClear = true;
        pendingTip = null;
      } else {
        pendingClear = false;
        pendingTip = next;
      }
      if (rafId === null) rafId = requestAnimationFrame(flushTip);
    };

    const onMouseMove = (event: maplibregl.MapMouseEvent) => {
      // Point query first — fast and gives the "correct" feature when the
      // cursor is squarely inside a polygon. If it misses, widen the
      // search to a small box so users can still hover/select tiny islands
      // (Kepulauan Seribu, Sabang, atolls) without sniper-precision aim.
      let features = map.queryRenderedFeatures(event.point, {
        layers: [REGION_FILL_LAYER_ID],
      });
      if (features.length === 0) {
        const p = event.point;
        features = map.queryRenderedFeatures(
          [
            [p.x - HIT_TOLERANCE_PX, p.y - HIT_TOLERANCE_PX],
            [p.x + HIT_TOLERANCE_PX, p.y + HIT_TOLERANCE_PX],
          ],
          { layers: [REGION_FILL_LAYER_ID] },
        );
      }
      const feature = features[0];
      map.getCanvas().style.cursor = feature ? "pointer" : "";

      const nextId =
        feature?.id !== undefined && feature.id !== null
          ? (feature.id as string | number)
          : null;

      // Tooltip update — throttled to rAF. Position tracks the cursor.
      if (feature) {
        const props = feature.properties as MapFeatureProperties | undefined;
        if (props) {
          const category =
            sourceRef.current === "predicted"
              ? props.predictedCategory
              : props.actualCategory;
          scheduleTip({
            kodeBps: props.kodeBps,
            kabupatenKota: props.kabupatenKota,
            provinsi: props.provinsi,
            tipe: props.tipe,
            category,
            prevalence: props.prevalence,
            lng: event.lngLat.lng,
            lat: event.lngLat.lat,
          });
        }
      } else {
        scheduleTip(null);
      }

      // Feature-state swap — synchronous, GPU-only.
      if (hoveredId === nextId) return;
      if (hoveredId !== null) {
        map.setFeatureState(
          { source: REGION_SOURCE_ID, id: hoveredId },
          { hover: false },
        );
      }
      hoveredId = nextId;
      if (hoveredId !== null) {
        map.setFeatureState(
          { source: REGION_SOURCE_ID, id: hoveredId },
          { hover: true },
        );
      }
    };

    const onMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      scheduleTip(null);
      if (hoveredId !== null) {
        map.setFeatureState(
          { source: REGION_SOURCE_ID, id: hoveredId },
          { hover: false },
        );
        hoveredId = null;
      }
    };

    const onIdle = () => {
      // Snap-back: when the camera settles with no part of Indonesia
      // visible, fit back to the tight Indonesia bbox. `idle` is more
      // reliable than `moveend` (it fires only when the camera has truly
      // stopped and tiles finished loading, so we don't fight ongoing
      // user gestures).
      const view = map.getBounds();
      const w = view.getWest();
      const e = view.getEast();
      const s = view.getSouth();
      const n = view.getNorth();
      const [[idoW, idoS], [idoE, idoN]] = boundsRef.current;
      const intersects = !(e < idoW || w > idoE || n < idoS || s > idoN);
      if (intersects) return;
      map.fitBounds(boundsRef.current as LngLatBoundsLike, {
        padding: FIT_BOUNDS_PADDING_PX,
        duration: 800,
      });
    };

    // movestart/moveend drive the overlay fade flag exposed via the map
    // state context. We use `movestart` (not `dragstart`) so wheel-zoom and
    // touch-pinch also trigger the fade — any USER camera motion counts.
    //
    // MapLibre fires the same events for programmatic camera changes
    // (`fitBounds`, `easeTo`) — those would otherwise hide the overlays
    // every time the user clicks a region (because click → auto-zoom fires
    // `movestart/moveend` internally). We gate the fade on
    // `event.originalEvent` which MapLibre populates ONLY when the move
    // was triggered by a browser input event (mouse, wheel, touch). For
    // programmatic camera moves it is `undefined`, so the listener no-ops.
    const onMoveStart = (event: { originalEvent?: unknown }) => {
      if (!event.originalEvent) return;
      onInteractionChange?.(true);
    };
    const onMoveEnd = (event: { originalEvent?: unknown }) => {
      if (!event.originalEvent) return;
      onInteractionChange?.(false);
    };

    // Hover listeners only matter on devices that can actually hover. On
    // touch-only devices synthesised mouse events from a tap would
    // otherwise flash a tooltip a frame before the bottom sheet opens.
    if (canHover) {
      map.on("mousemove", onMouseMove);
      map.on("mouseleave", onMouseLeave);
      map.getCanvas().addEventListener("mouseleave", onMouseLeave);
    }
    map.on("idle", onIdle);
    map.on("movestart", onMoveStart);
    map.on("moveend", onMoveEnd);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (canHover) {
        map.off("mousemove", onMouseMove);
        map.off("mouseleave", onMouseLeave);
        map.getCanvas().removeEventListener("mouseleave", onMouseLeave);
      }
      map.off("idle", onIdle);
      map.off("movestart", onMoveStart);
      map.off("moveend", onMoveEnd);
    };
  }, [canHover, isInteractive, mapReady, onInteractionChange]);

  /**
   * Re-apply basemap paint properties (sea + land bg) whenever the user
   * toggles theme. Observed via the same `data-theme` MutationObserver
   * pattern we use for the choropleth palette.
   */
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current?.getMap();
    if (!map) return;
    applyBasemapPaints(map);
    const observer = new MutationObserver(() => applyBasemapPaints(map));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [applyBasemapPaints, mapReady]);

  /**
   * One-shot geolocation request after the map is ready. If the user grants
   * access AND their position falls inside a known kab/kota, we both select
   * that region (opens the detail panel) and ease the camera to it. If they
   * deny, time out, or are outside Indonesia, we silently fall back to the
   * already-applied Indonesia bbox framing.
   *
   * The flow runs once per mount via `attemptedRef` — re-rendering the map
   * canvas (e.g. on year toggle) must not trigger a second permission
   * prompt, which would be jarring.
   */
  const geolocationAttemptedRef = useRef(false);
  useEffect(() => {
    if (!mapReady) return;
    // Background mode skips the geolocation prompt entirely. Marketing
    // surfaces (landing, auth) must not trigger a permission dialog on first
    // paint — that would be hostile UX before the user has even signed up.
    if (!isInteractive) return;
    if (geolocationAttemptedRef.current) return;
    geolocationAttemptedRef.current = true;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    /**
     * Resolve a kab/kota for a lng/lat. Returns false when the regions
     * layer isn't registered yet (style is loaded but react-map-gl hasn't
     * finished mounting `<Source>` + `<Layer>` children); caller should
     * retry via the map's `idle` event.
     */
    const trySnapToUserLocation = (
      longitude: number,
      latitude: number,
    ): boolean => {
      const map = mapRef.current?.getMap();
      if (!map) return false;
      // Layer may not exist yet on cached-permission flows where the
      // geolocation callback fires synchronously, before `<Source>` and
      // `<Layer>` finish mounting. Bail and retry — the `idle` event runs
      // once both style + sources are fully loaded.
      if (!map.getLayer(REGION_FILL_LAYER_ID)) return false;
      const point = map.project([longitude, latitude]);
      const matches = map.queryRenderedFeatures(point, {
        layers: [REGION_FILL_LAYER_ID],
      });
      const feature = matches[0];
      const kodeBps = feature?.properties?.kodeBps;
      if (typeof kodeBps !== "string") return true;
      onSelect?.(kodeBps);
      if (feature?.geometry) {
        const bbox = computeFeatureBbox(feature.geometry as Geometry);
        if (bbox) {
          map.fitBounds(bbox as LngLatBoundsLike, {
            padding: 80,
            duration: 1200,
            maxZoom: 8,
          });
        }
      }
      return true;
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        if (trySnapToUserLocation(longitude, latitude)) return;
        // Regions layer wasn't ready when the geolocation callback fired —
        // queue a single retry once the map finishes loading its sources.
        const map = mapRef.current?.getMap();
        if (!map) return;
        const onIdleOnce = () => {
          if (trySnapToUserLocation(longitude, latitude)) {
            map.off("idle", onIdleOnce);
          }
        };
        map.on("idle", onIdleOnce);
      },
      () => {
        // User denied permission, position unavailable, or timed out —
        // keep the default Indonesia framing without surfacing an error.
      },
      // 8s timeout strikes a balance: long enough for GPS warm-up on
      // mobile, short enough that the user doesn't wait forever.
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  }, [isInteractive, mapReady, onSelect]);

  return (
    <div className={cn("h-full w-full", className)}>
      <Map
        ref={mapRef}
        initialViewState={{
          // Fallback initial state used only for the brief moment before
          // `onLoad` runs `fitBounds(boundsRef.current)`. Picks a safe
          // center inside the Indonesia bbox so the user never sees
          // off-screen content during the swap.
          longitude: (bounds[0][0] + bounds[1][0]) / 2,
          latitude: (bounds[0][1] + bounds[1][1]) / 2,
          zoom: 4,
        }}
        mapStyle={MAP_STYLE_URL}
        interactiveLayerIds={isInteractive ? [REGION_FILL_LAYER_ID] : []}
        onClick={handleClick}
        onLoad={(event) => {
          // Snap the camera to the dataset-derived tight Indonesia bbox.
          // duration: 0 so the user lands on the framed view without an
          // animated zoom-in flash.
          event.target.fitBounds(boundsRef.current as LngLatBoundsLike, {
            padding: FIT_BOUNDS_PADDING_PX,
            duration: 0,
          });
          setMapReady(true);
        }}
        attributionControl={false}
        cooperativeGestures={false}
        scrollZoom={isInteractive}
        dragPan={isInteractive}
        dragRotate={false}
        pitchWithRotate={false}
        touchZoomRotate={isInteractive}
        touchPitch={false}
        doubleClickZoom={isInteractive}
        keyboard={isInteractive}
        maxZoom={9}
        minZoom={2}
      >
        {/* Anchored bottom-right so the search bar in the new `/map`
            header (top-left on mobile) never overlaps the basemap
            attribution. Bottom-left is taken by the desktop info card
            cluster, so bottom-right is the only consistently clear
            corner across breakpoints. */}
        <AttributionControl position="bottom-right" compact />

        <Source
          id={REGION_SOURCE_ID}
          type="geojson"
          data={stableFeatureCollection}
          promoteId="kodeBps"
        >
          <Layer id={REGION_FILL_LAYER_ID} type="fill" paint={fillPaint} />
          <Layer id={REGION_BORDER_LAYER_ID} type="line" paint={borderPaint} />
          <Layer
            id={REGION_HOVER_LAYER_ID}
            type="line"
            paint={hoverStrokePaint}
          />
          <Layer
            id={REGION_FOCUS_LAYER_ID}
            type="line"
            filter={focusFilter}
            paint={focusPaint}
          />
        </Source>

        {isInteractive && canHover && hover ? (
          <Popup
            longitude={hover.lng}
            latitude={hover.lat}
            anchor="top"
            offset={14}
            closeButton={false}
            closeOnClick={false}
            closeOnMove={false}
            focusAfterOpen={false}
            className="map-tip"
          >
            <HoverTipCard tip={hover} />
          </Popup>
        ) : null}
      </Map>
    </div>
  );
}

/**
 * Tiny mini-card rendered inside the MapLibre `<Popup>` on hover. Designed
 * to be glanceable: name + provinsi + prevalence + category badge. No
 * actions, no scroll — pure read-only feedback so the user can compare
 * adjacent regions without clicking each one.
 */
function HoverTipCard({ tip }: { readonly tip: HoverTip }) {
  return (
    <div className="glass-panel min-w-[14rem] rounded-xl px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {tip.tipe}
      </p>
      <p className="text-sm font-semibold text-foreground">
        {tip.kabupatenKota}
      </p>
      <p className="text-xs text-muted-foreground">{tip.provinsi}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="stat-number text-base font-semibold text-foreground">
          {tip.prevalence !== null
            ? `${tip.prevalence.toLocaleString("id-ID", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}%`
            : "—"}
        </span>
        {tip.category ? (
          <Badge tone={CATEGORY_BADGE_TONE[tip.category]}>{tip.category}</Badge>
        ) : (
          <Badge tone="neutral">Data tidak tersedia</Badge>
        )}
      </div>
    </div>
  );
}

function buildFillPaintFromPalette(
  source: MapSource,
  palette: {
    readonly rendah: string;
    readonly sedang: string;
    readonly tinggi: string;
  },
): ExpressionSpecification {
  const field = source === "predicted" ? "predictedCategory" : "actualCategory";
  return [
    "match",
    ["get", field],
    "Rendah",
    palette.rendah,
    "Sedang",
    palette.sedang,
    "Tinggi",
    palette.tinggi,
    "rgba(180, 180, 180, 0.35)",
  ];
}
