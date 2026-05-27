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

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import type {
  ExpressionSpecification,
  LngLatBoundsLike,
} from "maplibre-gl";

import type { MapFeatureProperties } from "./map-data";

import { Badge } from "@/components/primitives/badge";
import { CATEGORY_BADGE_TONE, type MapSource } from "@/config/map";
import { cn } from "@/lib/cn";

import { useMapState } from "./map-state-context";

/**
 * Bounding box (lon/lat) used to recenter the camera when the user pans the
 * map off Indonesia. Slightly padded so islands at the edges (Sabang, Merauke)
 * still feel comfortably inside the viewport when snapped back.
 */
const INDONESIA_RESET_BOUNDS = [
  [92, -13],
  [142, 8],
] as const satisfies LngLatBoundsLike;

/**
 * Default camera state on first load. Centered on the Java Sea so all major
 * islands (Sumatra, Java, Kalimantan, Sulawesi) are simultaneously visible
 * at zoom ~4.2 on a typical 1440px-wide viewport.
 */
const INITIAL_VIEW_STATE = {
  longitude: 117,
  latitude: -2.5,
  zoom: 4.2,
};

const MAP_STYLE_URL =
  "https://tiles.openfreemap.org/styles/positron";

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
  readonly className?: string;
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
  className,
}: MapCanvasProps) {
  const { setWilayah } = useMapState();
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
  const handleClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;
      const kodeBps = feature.properties?.kodeBps;
      if (typeof kodeBps !== "string") return;
      setWilayah(kodeBps);
    },
    [setWilayah],
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
        safeSet(id, "text-color", palette.text);
        safeSet(id, "text-halo-color", palette.textHalo);
        safeSet(id, "text-halo-width", 1.2);
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
      const features = map.queryRenderedFeatures(event.point, {
        layers: [REGION_FILL_LAYER_ID],
      });
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
      // visible, ease back to the default view. `idle` is more reliable
      // than `moveend` (it fires only when the camera has truly stopped
      // and tiles have finished loading, so we don't fight ongoing user
      // gestures).
      const view = map.getBounds();
      const w = view.getWest();
      const e = view.getEast();
      const s = view.getSouth();
      const n = view.getNorth();
      const [[idoW, idoS], [idoE, idoN]] = INDONESIA_RESET_BOUNDS;
      const intersects = !(e < idoW || w > idoE || n < idoS || s > idoN);
      if (intersects) return;
      map.easeTo({
        center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
        zoom: INITIAL_VIEW_STATE.zoom,
        duration: 800,
      });
    };

    map.on("mousemove", onMouseMove);
    map.on("mouseleave", onMouseLeave);
    map.getCanvas().addEventListener("mouseleave", onMouseLeave);
    map.on("idle", onIdle);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      map.off("mousemove", onMouseMove);
      map.off("mouseleave", onMouseLeave);
      map.getCanvas().removeEventListener("mouseleave", onMouseLeave);
      map.off("idle", onIdle);
    };
  }, [mapReady]);

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

  return (
    <div className={cn("h-full w-full", className)}>
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle={MAP_STYLE_URL}
        interactiveLayerIds={[REGION_FILL_LAYER_ID]}
        onClick={handleClick}
        onLoad={() => setMapReady(true)}
        attributionControl={false}
        cooperativeGestures={false}
        scrollZoom={true}
        dragRotate={false}
        pitchWithRotate={false}
        touchZoomRotate={true}
        maxZoom={9}
        minZoom={2}
      >
        <AttributionControl position="top-left" compact />

        <Source
          id={REGION_SOURCE_ID}
          type="geojson"
          data={stableFeatureCollection}
          promoteId="kodeBps"
        >
          <Layer
            id={REGION_FILL_LAYER_ID}
            type="fill"
            paint={fillPaint}
          />
          <Layer
            id={REGION_BORDER_LAYER_ID}
            type="line"
            paint={borderPaint}
          />
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

        {hover ? (
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
  const field =
    source === "predicted" ? "predictedCategory" : "actualCategory";
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
