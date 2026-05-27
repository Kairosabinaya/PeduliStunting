"use client";

/**
 * Client-side state for the Map page. Holds `tahun`, `sumber`, and `wilayah`
 * in React state — NOT URL params — so user interactions don't trigger
 * Next.js RSC round-trips (which were the source of the 1-2 s click delay).
 *
 * URL is still updated for shareability/back-button via
 * `window.history.replaceState`, but no Next router APIs are involved, so
 * the server never re-renders on selection or year change.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_MAP_SOURCE,
  DEFAULT_MAP_YEAR,
  MAP_SELECTION_PARAM,
  MAP_SOURCES,
  MAP_SOURCE_PARAM,
  MAP_YEAR_PARAM,
  type MapSource,
} from "@/config/map";
import { isSupportedYear, type SupportedYear } from "@/config/years";

export interface MapStateValue {
  readonly tahun: SupportedYear;
  readonly sumber: MapSource;
  readonly wilayah: string | null;
  /**
   * `true` while the user is actively dragging or zooming the camera. The
   * `MapShell` fades out floating overlays while this flag is on so the
   * user has an unobstructed view during interaction.
   */
  readonly isInteracting: boolean;
  setTahun(year: SupportedYear): void;
  setSumber(source: MapSource): void;
  setWilayah(kodeBps: string | null): void;
  setIsInteracting(value: boolean): void;
}

const MapStateContext = createContext<MapStateValue | null>(null);

export interface MapStateProviderProps {
  readonly initialTahun: SupportedYear;
  readonly initialSumber: MapSource;
  readonly initialWilayah: string | null;
  readonly children: ReactNode;
}

export function MapStateProvider({
  initialTahun,
  initialSumber,
  initialWilayah,
  children,
}: MapStateProviderProps) {
  const [tahun, setTahunState] = useState<SupportedYear>(initialTahun);
  const [sumber, setSumberState] = useState<MapSource>(initialSumber);
  const [wilayah, setWilayahState] = useState<string | null>(initialWilayah);
  const [isInteracting, setIsInteractingState] = useState(false);

  // Mirror state to the URL via history.replaceState so the user can share
  // links and Back/Forward work, but without invoking the Next.js router
  // (which would re-render the Server Component tree).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (tahun === DEFAULT_MAP_YEAR) {
      params.delete(MAP_YEAR_PARAM);
    } else {
      params.set(MAP_YEAR_PARAM, String(tahun));
    }
    if (sumber === DEFAULT_MAP_SOURCE) {
      params.delete(MAP_SOURCE_PARAM);
    } else {
      params.set(MAP_SOURCE_PARAM, sumber);
    }
    if (wilayah === null) {
      params.delete(MAP_SELECTION_PARAM);
    } else {
      params.set(MAP_SELECTION_PARAM, wilayah);
    }
    const qs = params.toString();
    const next = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;
    if (next !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", next);
    }
  }, [tahun, sumber, wilayah]);

  const setTahun = useCallback((year: SupportedYear) => {
    if (!isSupportedYear(year)) return;
    setTahunState(year);
  }, []);

  const setSumber = useCallback((source: MapSource) => {
    if (!MAP_SOURCES.includes(source)) return;
    setSumberState(source);
  }, []);

  const setWilayah = useCallback((kodeBps: string | null) => {
    setWilayahState(kodeBps);
  }, []);

  const setIsInteracting = useCallback((value: boolean) => {
    setIsInteractingState(value);
  }, []);

  const value = useMemo<MapStateValue>(
    () => ({
      tahun,
      sumber,
      wilayah,
      isInteracting,
      setTahun,
      setSumber,
      setWilayah,
      setIsInteracting,
    }),
    [
      isInteracting,
      setIsInteracting,
      setSumber,
      setTahun,
      setWilayah,
      sumber,
      tahun,
      wilayah,
    ],
  );

  return (
    <MapStateContext.Provider value={value}>
      {children}
    </MapStateContext.Provider>
  );
}

export function useMapState(): MapStateValue {
  const ctx = useContext(MapStateContext);
  if (!ctx) {
    throw new Error("useMapState must be used within <MapStateProvider>");
  }
  return ctx;
}
