import { redirect } from "next/navigation";

import { DEFAULT_AUTHENTICATED_ROUTE } from "@/config/routes";

import { LandingShell } from "@/components/features/landing/landing-shell";
import { tryServerSession } from "@/lib/server-session";

/**
 * Root route `/`. Auth-conditional:
 *
 *  - Authenticated visitors are redirected to `DEFAULT_AUTHENTICATED_ROUTE`
 *    (`/map` — the interactive choropleth). They have already passed the
 *    marketing surface; sending them through it again would feel like a detour.
 *  - Unauthenticated visitors get the landing-before-login experience: the warm
 *    four-act scroll story (`LandingShell` → `LandingStory`).
 *
 * The landing no longer mounts the fullscreen MapLibre canvas. The signature
 * map moment is now the build-time inline-SVG choropleth (zero map JS, zero
 * GeoJSON on the critical path), and the interactive MapLibre map lives one
 * click away at `/map`. Dropping the always-on canvas + its ~3 MB boundary
 * fetch is what keeps the landing within the Slow-3G LCP and initial-JS
 * budgets (project guidelines §7). No data fetch happens here anymore, so the route
 * also can no longer fail to load map data.
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await tryServerSession();
  if (session !== null) {
    redirect(DEFAULT_AUTHENTICATED_ROUTE);
  }

  return <LandingShell />;
}
