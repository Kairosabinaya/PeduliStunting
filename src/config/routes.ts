import { PUBLIC_ROUTES, DEFAULT_AUTHENTICATED_ROUTE } from "./app";

/** Path prefixes that are part of the auth flow itself. */
export const AUTH_ROUTE_PREFIX = "/auth";

/** Where unauthenticated visitors are sent when they try to enter the app. */
export const SIGN_IN_ROUTE = "/auth/sign-in";

/** Where the reset-password email lands the user before they can choose a new one. */
export const UPDATE_PASSWORD_ROUTE = "/auth/update-password";

/** Where the request-password-reset form lives. */
export const RESET_PASSWORD_ROUTE = "/auth/reset-password";

/**
 * Landing after a successful email/password sign-up when the project
 * requires email confirmation. The page tells the user to check their
 * inbox and provides a "resend verification" affordance.
 */
export const CHECK_EMAIL_ROUTE = "/auth/check-email";

/** Admin-only management surface. Layout guard enforces the `admin` role. */
export const ADMIN_ROUTE_PREFIX = "/admin";
export const ADMIN_USERS_ROUTE = "/admin/users";

/**
 * Auth routes that an authenticated session is allowed to visit. The
 * update-password page must remain reachable for users coming back from the
 * reset-link email: the callback exchanges the recovery token for a session
 * cookie, so by the time they arrive they are technically "signed in" and
 * would otherwise be bounced to the dashboard.
 */
const AUTH_ROUTES_ALLOWING_AUTHENTICATED: ReadonlySet<string> = new Set([
  UPDATE_PASSWORD_ROUTE,
]);

export { DEFAULT_AUTHENTICATED_ROUTE };

/**
 * Returns true when `pathname` matches a route that does not require an
 * authenticated session. Matches both exact entries from {@link PUBLIC_ROUTES}
 * and any nested path under `/auth/`.
 */
export function isPublicRoute(pathname: string): boolean {
  if (
    pathname.startsWith(`${AUTH_ROUTE_PREFIX}/`) ||
    pathname === AUTH_ROUTE_PREFIX
  ) {
    return true;
  }
  return PUBLIC_ROUTES.includes(pathname);
}

/** Returns true when `pathname` belongs to the auth flow (sign-in, sign-up, …). */
export function isAuthRoute(pathname: string): boolean {
  return (
    pathname === AUTH_ROUTE_PREFIX ||
    pathname.startsWith(`${AUTH_ROUTE_PREFIX}/`)
  );
}

/**
 * Returns true when an already-authenticated visitor should be bounced away
 * from this auth-flow path. Excludes routes that legitimately need a session
 * (for example update-password after the recovery callback).
 */
export function shouldRedirectAuthenticatedAway(pathname: string): boolean {
  if (!isAuthRoute(pathname)) return false;
  return !AUTH_ROUTES_ALLOWING_AUTHENTICATED.has(pathname);
}
