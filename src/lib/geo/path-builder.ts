/**
 * Convert GeoJSON geometry (Polygon or MultiPolygon) into an SVG `d` string.
 *
 * The page never imports this on the server — the data comes through as a
 * lazy-loaded prop on the client viewer. We accept only the two geometry types
 * that the import pipeline produces; anything else is treated as an empty path
 * so a stray feature cannot break the whole render.
 */

import type { Point2D, Projector } from "./projection";

interface GeoJsonPolygon {
  readonly type: "Polygon";
  readonly coordinates: ReadonlyArray<ReadonlyArray<readonly [number, number]>>;
}

interface GeoJsonMultiPolygon {
  readonly type: "MultiPolygon";
  readonly coordinates: ReadonlyArray<
    ReadonlyArray<ReadonlyArray<readonly [number, number]>>
  >;
}

export type GeoJsonGeometry = GeoJsonPolygon | GeoJsonMultiPolygon;

export function isPolygonLike(value: unknown): value is GeoJsonGeometry {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { type?: unknown; coordinates?: unknown };
  return (
    (candidate.type === "Polygon" || candidate.type === "MultiPolygon") &&
    Array.isArray(candidate.coordinates)
  );
}

function ringToPath(
  ring: ReadonlyArray<readonly [number, number]>,
  project: Projector,
): string {
  if (ring.length === 0) return "";
  const points: Point2D[] = ring.map((coord) => project(coord));
  const first = points[0];
  if (!first) return "";
  let path = `M${first.x.toFixed(2)} ${first.y.toFixed(2)}`;
  for (let i = 1; i < points.length; i += 1) {
    const point = points[i];
    if (!point) continue;
    path += `L${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }
  return `${path}Z`;
}

export function geometryToPath(geometry: unknown, project: Projector): string {
  if (!isPolygonLike(geometry)) return "";
  if (geometry.type === "Polygon") {
    return geometry.coordinates
      .map((ring) => ringToPath(ring, project))
      .join(" ");
  }
  return geometry.coordinates
    .flatMap((polygon) => polygon.map((ring) => ringToPath(ring, project)))
    .join(" ");
}
