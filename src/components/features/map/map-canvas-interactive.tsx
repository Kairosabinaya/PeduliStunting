"use client";

/**
 * Thin bridge between `MapStateContext` and the (now context-agnostic)
 * `MapCanvas`. Lives separately so the underlying canvas can be reused in
 * decorative `mode="background"` surfaces (landing-before-login, auth pages)
 * without dragging in a Provider those surfaces have no use for.
 *
 * Keep this file tiny — any logic beyond wiring the two callbacks belongs in
 * `MapCanvas` (rendering concerns) or `MapStateContext` (state concerns).
 */

import { MapCanvas, type MapCanvasProps } from "./map-canvas";
import { useMapState } from "./map-state-context";

type MapCanvasInteractiveProps = Omit<
  MapCanvasProps,
  "mode" | "onSelect" | "onInteractionChange"
>;

export function MapCanvasInteractive(props: MapCanvasInteractiveProps) {
  const { setWilayah, setIsInteracting } = useMapState();
  return (
    <MapCanvas
      {...props}
      mode="interactive"
      onSelect={setWilayah}
      onInteractionChange={setIsInteracting}
    />
  );
}
