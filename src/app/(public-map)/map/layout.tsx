import type { ReactNode } from "react";

import { MAP_COPY } from "@/config/map";

/**
 * Nested layout for `/map`. The page beneath owns every `position: fixed`
 * overlay (canvas, header, side panels, bottom sheet) so the layout itself
 * just guarantees a fullscreen container without scroll. The previous
 * `(app)/map/layout.tsx` collapsed the parent app-shell's padding via
 * negative margins; under `(public-map)` the parent has no padding, so the
 * layout is a clean pass-through.
 */
export const metadata = {
  title: "Peta",
  description: MAP_COPY.description,
};

interface MapLayoutProps {
  readonly children: ReactNode;
}

export default function MapLayout({ children }: MapLayoutProps) {
  return <div className="h-dvh-screen">{children}</div>;
}
