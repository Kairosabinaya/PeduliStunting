/**
 * Shell for the unauthenticated `/` (root) surface.
 *
 * Applies the warm landing identity (the `.theme-landing` token scope + the
 * Bricolage Grotesque display font variable) to the whole scroll story, then
 * renders {@link LandingStory}. The previous fullscreen MapLibre backdrop was
 * removed: the signature inline-SVG choropleth (built at compile time) is now
 * the map moment, and the interactive MapLibre map lives one click away at
 * `/map`. Dropping the always-on canvas removes ~210 KB of map JS and the
 * ~3 MB district GeoJSON from the landing's critical path, which is what keeps
 * the page within the Slow-3G LCP + initial-JS budgets (project guidelines §7).
 */

import { Bricolage_Grotesque } from "next/font/google";

import { cn } from "@/lib/cn";

import { LandingStory } from "./landing-story";

/**
 * Editorial display typeface for the landing headlines + display stats.
 * Variable font, `swap`, exposed as `--font-display`. The variable is applied
 * ONLY on the `.theme-landing` wrapper, so it is scoped to the landing and
 * `/edukasi` keeps Plus Jakarta Sans (see globals.css `.theme-landing :is(…)`).
 */
const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export function LandingShell() {
  return (
    <div
      className={cn(
        "theme-landing relative isolate min-h-dvh bg-background",
        bricolageGrotesque.variable,
      )}
    >
      <LandingStory />
    </div>
  );
}
