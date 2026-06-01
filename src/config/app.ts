/**
 * Application-level constants. Domain rules and copy live here instead of
 * being scattered as magic strings/numbers across the codebase.
 */

import { env } from "./env";

export const APP_NAME = env.NEXT_PUBLIC_APP_NAME;
export const APP_URL = env.NEXT_PUBLIC_APP_URL;
export const APP_LOCALE = "id-ID";

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
