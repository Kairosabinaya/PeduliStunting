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
 * the page within the Slow-3G LCP + initial-JS budgets.
 */

import { cn } from "@/lib/cn";
import { displayFont } from "@/lib/fonts";

import { LandingStory } from "./landing-story";

export function LandingShell() {
  return (
    <div
      className={cn(
        "theme-landing relative isolate min-h-dvh bg-background",
        displayFont.variable,
      )}
    >
      <LandingStory />
    </div>
  );
}
