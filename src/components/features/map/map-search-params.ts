/**
 * URL search-param parsing for the Map page.
 *
 * The page is an ISR Server Component: search params drive what is rendered
 * (year, data source, selected region). Parsing happens once on the server,
 * and the resolved values flow as plain props to the client viewer.
 */

import {
  DEFAULT_MAP_SOURCE,
  DEFAULT_MAP_YEAR,
  MAP_SELECTION_PARAM,
  MAP_SOURCES,
  MAP_SOURCE_PARAM,
  MAP_YEAR_PARAM,
  type MapSource,
} from "@/config/map";
import { isSupportedYear, type SupportedYear } from "@/config/years";

export interface MapSearchInput {
  readonly [key: string]: string | string[] | undefined;
}

export interface ParsedMapSearch {
  readonly tahun: SupportedYear;
  readonly sumber: MapSource;
  readonly selection: string | null;
}

function pickFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseMapSearchParams(
  input: MapSearchInput | undefined,
): ParsedMapSearch {
  const rawYear = pickFirst(input?.[MAP_YEAR_PARAM]);
  const parsedYear = rawYear === undefined ? Number.NaN : Number(rawYear);
  const tahun: SupportedYear =
    Number.isFinite(parsedYear) && isSupportedYear(parsedYear)
      ? parsedYear
      : DEFAULT_MAP_YEAR;

  const rawSource = pickFirst(input?.[MAP_SOURCE_PARAM]);
  const sumber: MapSource =
    rawSource !== undefined &&
    (MAP_SOURCES as readonly string[]).includes(rawSource)
      ? (rawSource as MapSource)
      : DEFAULT_MAP_SOURCE;

  const rawSelection = pickFirst(input?.[MAP_SELECTION_PARAM]);
  const selection =
    rawSelection !== undefined && /^\d{4}$/u.test(rawSelection)
      ? rawSelection
      : null;

  return { tahun, sumber, selection };
}

/**
 * Compose a new query string preserving any params we do not own. Pass `null`
 * to remove a key. Used by client controls (year slider, source toggle,
 * region selector) so URL state stays the source of truth.
 */
export function buildMapHref(
  current: URLSearchParams,
  patch: Readonly<Record<string, string | null>>,
): string {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }
  const search = next.toString();
  return search.length === 0 ? "" : `?${search}`;
}
