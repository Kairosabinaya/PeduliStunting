"""
Convert `docs/source/indo_kabkota_2023.gpkg` to a simplified GeoJSON
FeatureCollection written at `docs/source/_generated/kabkota.geojson`.

Why Python instead of mapshaper/ogr2ogr?
  - mapshaper needs `better-sqlite3` native bindings to read GeoPackage; that
    binding cannot build on the Windows dev box without Visual Studio Build
    Tools.
  - ogr2ogr requires a full GDAL install — also non-trivial on Windows.
  - GeoPackage is just a SQLite file with WKB-encoded geometry blobs prefixed
    by a small header (spec at https://www.geopackage.org/spec/). Python's
    stdlib `sqlite3` plus `shapely` (pure wheel install) parse it cleanly.

Run with:
  python scripts/export-boundaries-from-gpkg.py

The output is gitignored (`docs/source/_generated/` is under the ignored
`docs/source/` tree). The TS importer (`scripts/import-boundaries.ts`) reads
the generated file and upserts each feature into Supabase.
"""

from __future__ import annotations

import json
import sqlite3
import struct
import sys
from pathlib import Path

from shapely import wkb
from shapely.geometry import mapping
from shapely.geometry.base import BaseGeometry

PROJECT_ROOT = Path(__file__).resolve().parent.parent
GPKG_PATH = PROJECT_ROOT / "docs" / "source" / "indo_kabkota_2023.gpkg"
OUT_PATH = (
    PROJECT_ROOT / "docs" / "source" / "_generated" / "kabkota.geojson"
)

# Topology-preserving simplify tolerance in CRS units. The source CRS is
# EPSG:4326 (degrees). 0.005 deg ~ 550 m at the equator — comfortably
# below the visual resolution of a national-scale choropleth.
SIMPLIFY_TOLERANCE_DEG = 0.005

# Coordinate precision in decimal places. 4 dp = ~11 m at the equator,
# which is far below what's visually distinguishable at choropleth zoom
# levels. The default Python float repr produces ~14 dp; trimming saves
# roughly 50-60% of the GeoJSON payload size, which directly reduces the
# bytes the client has to parse and the time MapLibre needs to tessellate.
COORD_DECIMALS = 4


def round_geometry(geom):
    """Round every coordinate to `COORD_DECIMALS` decimal places in-place.

    Walks the GeoJSON-shaped dict produced by `shapely.geometry.mapping()`.
    Handles Point/LineString/Polygon/Multi* by recursing on nested arrays.
    """
    coords = geom.get("coordinates")
    if coords is not None:
        geom["coordinates"] = _round_coords(coords)
    return geom


def _round_coords(coords):
    if isinstance(coords, (int, float)):
        return round(float(coords), COORD_DECIMALS)
    if isinstance(coords, (list, tuple)):
        return [_round_coords(c) for c in coords]
    return coords


def decode_gpkg_geometry_blob(blob: bytes) -> BaseGeometry | None:
    """Strip the GeoPackage binary header and decode the trailing WKB."""

    if len(blob) < 8 or blob[0:2] != b"GP":
        return None
    flags = blob[3]
    envelope_type = (flags >> 1) & 0b111
    # bit 4 indicates an empty geometry; we keep the WKB pass-through anyway
    # because shapely returns an empty geometry object for those rows.
    envelope_bytes = {0: 0, 1: 32, 2: 48, 3: 48, 4: 64}.get(envelope_type)
    if envelope_bytes is None:
        return None
    wkb_offset = 8 + envelope_bytes
    wkb_blob = blob[wkb_offset:]
    if not wkb_blob:
        return None
    try:
        return wkb.loads(wkb_blob)
    except Exception:  # noqa: BLE001 — fail open on a per-feature basis
        return None


def discover_feature_table(conn: sqlite3.Connection) -> tuple[str, str, str]:
    """Locate the (table, geom column, identifier-friendly name) tuple."""

    rows = conn.execute(
        "SELECT table_name FROM gpkg_contents WHERE data_type = 'features'"
    ).fetchall()
    if not rows:
        raise RuntimeError("No 'features' entry in gpkg_contents.")
    table = rows[0][0]
    geom_rows = conn.execute(
        "SELECT column_name FROM gpkg_geometry_columns WHERE table_name = ?",
        (table,),
    ).fetchall()
    if not geom_rows:
        raise RuntimeError(
            f"No geometry column registered for table {table!r}."
        )
    geom_col = geom_rows[0][0]
    return table, geom_col, table


def list_columns(conn: sqlite3.Connection, table: str) -> list[str]:
    cur = conn.execute(f'PRAGMA table_info("{table}")')
    return [row[1] for row in cur.fetchall()]


def main() -> int:
    if not GPKG_PATH.exists():
        print(f"[export-boundaries] missing: {GPKG_PATH}", file=sys.stderr)
        return 1
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    print(f"[export-boundaries] reading {GPKG_PATH}", flush=True)
    conn = sqlite3.connect(GPKG_PATH)
    try:
        table, geom_col, _label = discover_feature_table(conn)
        columns = list_columns(conn, table)
        attr_cols = [c for c in columns if c != geom_col]
        sql = (
            f'SELECT "{geom_col}", '
            + ", ".join(f'"{c}"' for c in attr_cols)
            + f' FROM "{table}"'
        )
        print(
            f"[export-boundaries] table={table} geom={geom_col} "
            f"attrs={len(attr_cols)}",
            flush=True,
        )
        features: list[dict] = []
        decoded = 0
        decode_failed = 0
        empty = 0
        for row in conn.execute(sql):
            blob = row[0]
            geometry = decode_gpkg_geometry_blob(blob) if blob else None
            if geometry is None:
                decode_failed += 1
                continue
            if geometry.is_empty:
                empty += 1
                continue
            simplified = geometry.simplify(
                SIMPLIFY_TOLERANCE_DEG, preserve_topology=True
            )
            properties = {
                col: row[i + 1] for i, col in enumerate(attr_cols)
            }
            features.append(
                {
                    "type": "Feature",
                    "properties": properties,
                    "geometry": round_geometry(mapping(simplified)),
                }
            )
            decoded += 1
    finally:
        conn.close()

    collection = {"type": "FeatureCollection", "features": features}
    with OUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(collection, f, ensure_ascii=False)
    print(
        f"[export-boundaries] wrote {OUT_PATH} "
        f"(features={decoded}, decode_failed={decode_failed}, empty={empty})",
        flush=True,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
