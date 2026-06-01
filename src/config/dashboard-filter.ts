/**
 * Cross-filter constants for the `/data` dashboard. The two global filters
 * (year + region) mirror to the URL so a filtered view is shareable and
 * survives reload. Param keys live here as the single source of truth, mirrored
 * on `src/config/map.ts` which uses the same `tahun`/`wilayah` convention.
 */

import { MAX_YEAR } from "@/config/years";

/** URL search-param key controlling the active year on the dashboard. */
export const DASHBOARD_YEAR_PARAM = "tahun";

/** URL search-param key controlling the selected region (`kode_bps`). */
export const DASHBOARD_REGION_PARAM = "wilayah";

/** Default year when no `?tahun=` is present: the latest available year. */
export const DEFAULT_DASHBOARD_YEAR = MAX_YEAR;
