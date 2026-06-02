/**
 * Application-level constants. Domain rules and copy live here instead of
 * being scattered as magic strings/numbers across the codebase.
 */

import { env } from "./env";

export const APP_NAME = env.NEXT_PUBLIC_APP_NAME;
export const APP_URL = env.NEXT_PUBLIC_APP_URL;
export const APP_LOCALE = "id-ID";

/** Author/owner of the application, shown in the site-wide copyright notice. */
export const APP_AUTHOR = "Kairos Abinaya Susanto";

/** Year stamped on the copyright notice. */
export const COPYRIGHT_YEAR = 2026;

/**
 * Single source of truth for the copyright line rendered on every page
 * (footer on standard layouts, info card on `/map`, closing block on the
 * landing). Referencing this constant everywhere keeps the string from
 * drifting across surfaces (project guidelines Section 2/4).
 *
 * @example
 * ```ts
 * COPYRIGHT_NOTICE; // "© 2026 Kairos Abinaya Susanto"
 * ```
 */
export const COPYRIGHT_NOTICE = `© ${COPYRIGHT_YEAR} ${APP_AUTHOR}`;

/** Route that authenticated users land on after sign-in. */
export const DEFAULT_AUTHENTICATED_ROUTE = "/map";

/** Public landing page — the pre-auth home surface. */
export const LANDING_ROUTE = "/";

/** Public routes that do not require an authenticated session. */
export const PUBLIC_ROUTES: readonly string[] = [
  LANDING_ROUTE,
  "/map",
  "/data",
  "/prediksi",
  // Kept public so old links hitting /dashboard pass the proxy gate and reach
  // its server-side redirect to /data.
  "/dashboard",
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/callback",
  "/auth/reset-password",
  "/auth/update-password",
] as const;
