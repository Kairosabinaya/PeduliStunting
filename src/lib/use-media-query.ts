"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe `matchMedia` subscription.
 *
 * Returns `false` during server render and the first client paint to keep
 * markup deterministic across environments. The hook then synchronises with
 * the live `MediaQueryList` on mount, so the very first React-driven render
 * matches the actual device.
 *
 * Why not `useSyncExternalStore`? `getServerSnapshot()` would force us to
 * return a fixed value anyway, and the two-paint hydration approach here is
 * easier to reason about for two specific call sites we have today (mobile
 * sheet swap and touch-vs-hover guard).
 *
 * @example
 * ```ts
 * const isDesktop = useMediaQuery("(min-width: 1024px)");
 * const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const update = (event: MediaQueryList | MediaQueryListEvent): void => {
      setMatches(event.matches);
    };
    update(mql);
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}
