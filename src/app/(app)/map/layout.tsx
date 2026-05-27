import type { ReactNode } from "react";

import { MAP_COPY } from "@/config/map";

/**
 * Nested layout for `/map`. The parent `(app)/layout.tsx` wraps content in a
 * padded, max-width container suited to dashboard-style pages. The map wants
 * a true fullscreen canvas — like Google Maps or GeoPangan — so this layout
 * collapses the parent padding back to zero and renders children inline.
 *
 * The map page itself owns all `position: fixed` overlays, so the parent's
 * empty padded space is fully covered by the map canvas. No scroll is
 * generated because every element is fixed.
 */
export const metadata = {
  title: "Peta",
  description: MAP_COPY.description,
};

interface MapLayoutProps {
  readonly children: ReactNode;
}

export default function MapLayout({ children }: MapLayoutProps) {
  return (
    // -mt-24 md:-mt-28 cancels the parent's `pt-24 md:pt-28`.
    // -mb-12 cancels the parent's `pb-12`.
    // -mx-4 md:-mx-6 cancels the parent's container horizontal padding.
    // The result is a child surface that occupies the full parent viewport.
    <div className="-mx-4 -mb-12 -mt-24 md:-mx-6 md:-mt-28">{children}</div>
  );
}
