/**
 * Build-time generator for the landing signature choropleth.
 *
 * Reads the simplified district boundaries (`region_boundaries.geometry`) and
 * the latest-year stunting indicators (`region_indicators`) from Supabase, then
 * projects every kabupaten/kota into a single inline-SVG path set. The result
 * is committed as `src/lib/data/choropleth-paths.json` so the landing ships the
 * map as lightweight static SVG with ZERO geographic library at runtime.
 *
 * Projection is plain equirectangular computed here at build time — Indonesia
 * sits on the equator so latitude distortion is negligible at choropleth zoom,
 * and the client never sees a projection step.
 *
 * The source GeoJSON is highly detailed (≈3 MB; ~3000 chars per district path).
 * Inlining that verbatim would blow the route's JS/transfer budget, so this
 * script aggressively shrinks the geometry while preserving the recognisable
 * national silhouette at the displayed size (~1000 px wide, where 1 viewBox
 * unit ≈ 5 km):
 *   1. coordinates rounded to 1 decimal (~0.5 km, sub-pixel),
 *   2. vertices closer than `MIN_POINT_GAP` to the previous kept one dropped,
 *   3. rings whose bounding box is smaller than `MIN_RING_SPAN` dropped
 *      (tiny islands invisible at this zoom),
 *   4. pemekaran duplicates (same physical kab/kota under an old + new BPS
 *      code) collapsed to one, preferring the entry that has 2024 data.
 *
 * Usage:  pnpm build:choropleth
 *   (wired as `tsx --env-file=.env.local scripts/generate-choropleth-svg.ts`)
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { env, exit } from "node:process";

import { createClient } from "@supabase/supabase-js";
import type { Geometry, MultiPolygon, Polygon, Position } from "geojson";

import { STUNTING_CATEGORY_THRESHOLDS } from "@/config/map";
import { MAX_YEAR } from "@/config/years";
import type { Database } from "@/types/supabase";

const OUTPUT_PATH = resolve("src/lib/data/choropleth-paths.json");
const VIEWBOX_WIDTH = 1000;
const COORD_DECIMALS = 1;
/**
 * Minimum gap (viewBox units) between consecutive kept vertices. ~1 unit ≈ 5 km
 * at the displayed width, so 0.6 ≈ 3 km — below one rendered pixel, but it sheds
 * the dense redundant vertices the source carries.
 */
const MIN_POINT_GAP = 1.2;
/**
 * Drop rings whose projected bounding box diagonal is below this (viewBox
 * units). At ~5 km/unit, 3 ≈ 15 km — islands smaller than ~3 px on the
 * rendered map, invisible to the reader but expensive in the payload. The
 * choropleth is a national-silhouette story device, not a navigational map,
 * so shedding micro-islands costs nothing the reader can perceive.
 */
const MIN_RING_SPAN = 3;

type Severity = "Rendah" | "Sedang" | "Tinggi";

interface BBox {
  readonly minLon: number;
  readonly maxLon: number;
  readonly minLat: number;
  readonly maxLat: number;
}

interface ChoroplethPath {
  readonly kodeBps: string;
  readonly kabupatenKota: string;
  readonly provinsi: string;
  readonly severity: Severity | null;
  readonly prevalence: number | null;
  readonly d: string;
}

/** Narrow a Supabase `Json` value to a polygonal GeoJSON geometry. */
function asPolygonal(value: unknown): Polygon | MultiPolygon | null {
  if (value === null || typeof value !== "object") return null;
  const geom = value as Geometry;
  if (geom.type === "Polygon" || geom.type === "MultiPolygon") return geom;
  return null;
}

/** Iterate every [lon, lat] position of a polygonal geometry. */
function* positions(geom: Polygon | MultiPolygon): Generator<Position> {
  const polygons =
    geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (const point of ring) yield point;
    }
  }
}

function computeBBox(geometries: readonly (Polygon | MultiPolygon)[]): BBox {
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const geom of geometries) {
    for (const [lon, lat] of positions(geom)) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }
  return { minLon, maxLon, minLat, maxLat };
}

function round(value: number): number {
  const factor = 10 ** COORD_DECIMALS;
  return Math.round(value * factor) / factor;
}

function project(
  [lon, lat]: Position,
  bbox: BBox,
  height: number,
): readonly [number, number] {
  const x = ((lon - bbox.minLon) / (bbox.maxLon - bbox.minLon)) * VIEWBOX_WIDTH;
  const y = ((bbox.maxLat - lat) / (bbox.maxLat - bbox.minLat)) * height;
  return [round(x), round(y)];
}

/** Bounding-box diagonal of projected points, used for the tiny-ring cull. */
function ringSpan(points: readonly (readonly [number, number])[]): number {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return Math.hypot(maxX - minX, maxY - minY);
}

/**
 * Drop vertices closer than `MIN_POINT_GAP` to the previously kept one. First
 * and last points are always kept so the closure is preserved. Falls back to
 * the full ring if decimation would collapse it below a triangle.
 */
function decimate(
  points: readonly (readonly [number, number])[],
): readonly (readonly [number, number])[] {
  if (points.length <= 4) return points;
  const kept: (readonly [number, number])[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const last = kept[kept.length - 1];
    const dx = points[i][0] - last[0];
    const dy = points[i][1] - last[1];
    if (dx * dx + dy * dy >= MIN_POINT_GAP * MIN_POINT_GAP)
      kept.push(points[i]);
  }
  kept.push(points[points.length - 1]);
  return kept.length >= 4 ? kept : points;
}

function ringToPath(ring: Position[], bbox: BBox, height: number): string {
  const projected = ring.map((point) => project(point, bbox, height));
  if (ringSpan(projected) < MIN_RING_SPAN) return "";
  const points = decimate(projected);
  if (points.length < 3) return "";
  const [first, ...rest] = points;
  const head = `M${first[0]} ${first[1]}`;
  const tail = rest.map(([x, y]) => `L${x} ${y}`).join("");
  return `${head}${tail}Z`;
}

function geometryToPath(
  geom: Polygon | MultiPolygon,
  bbox: BBox,
  height: number,
): string {
  const polygons =
    geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
  return polygons
    .flatMap((polygon) => polygon.map((ring) => ringToPath(ring, bbox, height)))
    .join("");
}

function severityFromPrevalence(prevalence: number | null): Severity | null {
  if (prevalence === null) return null;
  // WHO cut-offs mirrored from STUNTING_CATEGORY_THRESHOLDS: Rendah < 20,
  // Sedang 20..<30, Tinggi >= 30 (see src/config/map.ts).
  if (prevalence < STUNTING_CATEGORY_THRESHOLDS.Rendah.upperExclusive) {
    return "Rendah";
  }
  if (prevalence < STUNTING_CATEGORY_THRESHOLDS.Sedang.upperExclusive) {
    return "Sedang";
  }
  return "Tinggi";
}

/**
 * Collapse pemekaran duplicates. The 2022 Papua split re-numbered ~26
 * kabupaten/kota, so the same physical polygon exists under both an old and a
 * new BPS code (one of which lacks 2024 data). Keyed on the geometry path, keep
 * the entry that has a severity so the map never paints a "no data" polygon on
 * top of a coloured one.
 */
function dedupeByGeometry(
  paths: readonly ChoroplethPath[],
): readonly ChoroplethPath[] {
  const byShape = new Map<string, ChoroplethPath>();
  for (const path of paths) {
    if (path.d.length === 0) continue;
    const incumbent = byShape.get(path.d);
    if (!incumbent) {
      byShape.set(path.d, path);
      continue;
    }
    if (incumbent.severity === null && path.severity !== null) {
      byShape.set(path.d, path);
    }
  }
  return [...byShape.values()];
}

function requireEnv(name: string): string {
  const value = env[name];
  if (value === undefined || value.length === 0) {
    console.error(`Missing required env: ${name}`);
    exit(1);
  }
  return value;
}

async function main(): Promise<void> {
  const supabase = createClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  );

  const [regionsRes, boundariesRes, indicatorsRes] = await Promise.all([
    supabase.from("regions").select("kode_bps, kabupaten_kota, provinsi"),
    supabase.from("region_boundaries").select("kode_bps, geometry"),
    supabase
      .from("region_indicators")
      .select("kode_bps, y_category, y1_prevalence")
      .eq("tahun", MAX_YEAR),
  ]);

  for (const res of [regionsRes, boundariesRes, indicatorsRes]) {
    if (res.error) {
      console.error("Supabase query failed:", res.error.message);
      exit(1);
    }
  }

  const regions = new Map((regionsRes.data ?? []).map((r) => [r.kode_bps, r]));
  const indicators = new Map(
    (indicatorsRes.data ?? []).map((i) => [i.kode_bps, i]),
  );

  const parsed = (boundariesRes.data ?? [])
    .map((row) => ({ kodeBps: row.kode_bps, geom: asPolygonal(row.geometry) }))
    .filter(
      (row): row is { kodeBps: string; geom: Polygon | MultiPolygon } =>
        row.geom !== null,
    );

  const bbox = computeBBox(parsed.map((p) => p.geom));
  const lonSpan = bbox.maxLon - bbox.minLon;
  const latSpan = bbox.maxLat - bbox.minLat;
  const height = Math.round((VIEWBOX_WIDTH * latSpan) / lonSpan);

  const projected: ChoroplethPath[] = parsed
    .map((row) => {
      const region = regions.get(row.kodeBps);
      const indicator = indicators.get(row.kodeBps);
      const prevalence = indicator?.y1_prevalence ?? null;
      const severity =
        (indicator?.y_category as Severity | undefined) ??
        severityFromPrevalence(prevalence);
      return {
        kodeBps: row.kodeBps,
        kabupatenKota: region?.kabupaten_kota ?? row.kodeBps,
        provinsi: region?.provinsi ?? "",
        severity,
        prevalence,
        d: geometryToPath(row.geom, bbox, height),
      };
    })
    .filter((path) => path.d.length > 0);

  const paths = dedupeByGeometry(projected).sort((a, b) =>
    a.kodeBps.localeCompare(b.kodeBps),
  );

  const output = {
    generatedFor: `SSGI ${MAX_YEAR}`,
    viewBox: { width: VIEWBOX_WIDTH, height },
    bounds: bbox,
    year: MAX_YEAR,
    paths,
  };

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(output), "utf8");
  console.log(
    `Wrote ${paths.length} district paths to ${OUTPUT_PATH} ` +
      `(viewBox ${VIEWBOX_WIDTH}x${height}).`,
  );
}

void main();
