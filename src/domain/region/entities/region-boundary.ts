import type { KodeBps } from "../value-objects/kode-bps";

/**
 * Geometry payload for a region. We do not parse the GeoJSON inside the
 * domain — it is consumed verbatim by the client map layer. The shape is
 * preserved as `unknown` so the domain stays free of map-library coupling.
 */
export class RegionBoundary {
  readonly kodeBps: KodeBps;
  readonly geometry: unknown;
  readonly simplificationTolerance: number | null;
  readonly source: string | null;

  constructor(props: {
    kodeBps: KodeBps;
    geometry: unknown;
    simplificationTolerance: number | null;
    source: string | null;
  }) {
    this.kodeBps = props.kodeBps;
    this.geometry = props.geometry;
    this.simplificationTolerance = props.simplificationTolerance;
    this.source = props.source;
  }
}
