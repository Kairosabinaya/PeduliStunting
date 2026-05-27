/**
 * Lightweight equirectangular projection for the Indonesian archipelago.
 *
 * The map page uses a fixed bounding box (see {@link INDONESIA_BBOX}) and a
 * fixed SVG viewBox so we do not pull in d3-geo or maplibre-gl just to render
 * static administrative borders. Equirectangular distortion at Indonesia's
 * latitudes (≤ ±11°) is below 2% horizontally, which is acceptable for an
 * overview choropleth — the goal is selecting and comparing regions, not
 * surveying.
 */

export interface BBox {
  readonly minLon: number;
  readonly maxLon: number;
  readonly minLat: number;
  readonly maxLat: number;
}

export interface ViewBox {
  readonly width: number;
  readonly height: number;
}

export interface Point2D {
  readonly x: number;
  readonly y: number;
}

export type Projector = (lonLat: readonly [number, number]) => Point2D;

/**
 * Build a projector that maps WGS84 lon/lat tuples to SVG x/y inside the given
 * viewBox. The projection preserves the bbox aspect ratio: the longer axis
 * fills the viewBox and the shorter axis is centred so coastlines never touch
 * the canvas edge.
 *
 * @example
 * ```ts
 * const project = makeProjector(INDONESIA_BBOX, MAP_VIEWBOX);
 * const { x, y } = project([106.8, -6.2]); // Jakarta
 * ```
 */
export function makeProjector(bbox: BBox, viewBox: ViewBox): Projector {
  const lonSpan = bbox.maxLon - bbox.minLon;
  const latSpan = bbox.maxLat - bbox.minLat;
  if (lonSpan <= 0 || latSpan <= 0) {
    throw new Error("makeProjector: bbox must have positive span");
  }
  if (viewBox.width <= 0 || viewBox.height <= 0) {
    throw new Error("makeProjector: viewBox must have positive dimensions");
  }

  const scaleX = viewBox.width / lonSpan;
  const scaleY = viewBox.height / latSpan;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (viewBox.width - lonSpan * scale) / 2;
  const offsetY = (viewBox.height - latSpan * scale) / 2;

  return ([lon, lat]) => ({
    x: offsetX + (lon - bbox.minLon) * scale,
    // SVG y axis points downward; latitude grows northward, hence the flip.
    y: offsetY + (bbox.maxLat - lat) * scale,
  });
}
