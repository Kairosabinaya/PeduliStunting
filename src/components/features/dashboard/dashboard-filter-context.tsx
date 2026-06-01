"use client";

/**
 * Client-side cross-filter state for the `/data` dashboard: the active `year`
 * and the `selectedKodeBps` (region). Held in React state — NOT URL params — so
 * every filter change recomputes the charts on the client with no Next.js RSC
 * round-trip. The URL is still mirrored via `window.history.replaceState` for
 * shareable, reload-safe links, but no Next router API is involved. Mirrors the
 * pattern of the map page's `MapStateProvider`.
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
  DASHBOARD_REGION_PARAM,
  DASHBOARD_YEAR_PARAM,
  DEFAULT_DASHBOARD_YEAR,
} from "@/config/dashboard-filter";
import { isSupportedYear, type SupportedYear } from "@/config/years";

export interface DashboardFilterValue {
  readonly year: SupportedYear;
  readonly selectedKodeBps: string | null;
  setYear(year: SupportedYear): void;
  setSelectedKodeBps(kodeBps: string | null): void;
  clearSelection(): void;
}

const DashboardFilterContext = createContext<DashboardFilterValue | null>(null);

export interface DashboardFilterProviderProps {
  readonly initialYear: SupportedYear;
  readonly initialKodeBps: string | null;
  readonly children: ReactNode;
}

export function DashboardFilterProvider({
  initialYear,
  initialKodeBps,
  children,
}: DashboardFilterProviderProps) {
  const [year, setYearState] = useState<SupportedYear>(initialYear);
  const [selectedKodeBps, setSelectedKodeBpsState] = useState<string | null>(
    initialKodeBps,
  );

  // Mirror state to the URL without invoking the Next router (no server
  // re-render). Default year and a null region are omitted to keep links clean.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (year === DEFAULT_DASHBOARD_YEAR) params.delete(DASHBOARD_YEAR_PARAM);
    else params.set(DASHBOARD_YEAR_PARAM, String(year));
    if (selectedKodeBps === null) params.delete(DASHBOARD_REGION_PARAM);
    else params.set(DASHBOARD_REGION_PARAM, selectedKodeBps);
    const qs = params.toString();
    const next = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;
    if (next !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", next);
    }
  }, [year, selectedKodeBps]);

  const setYear = useCallback((value: SupportedYear) => {
    if (!isSupportedYear(value)) return;
    setYearState(value);
  }, []);

  const setSelectedKodeBps = useCallback((kodeBps: string | null) => {
    setSelectedKodeBpsState(kodeBps);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedKodeBpsState(null);
  }, []);

  const value = useMemo<DashboardFilterValue>(
    () => ({
      year,
      selectedKodeBps,
      setYear,
      setSelectedKodeBps,
      clearSelection,
    }),
    [year, selectedKodeBps, setYear, setSelectedKodeBps, clearSelection],
  );

  return (
    <DashboardFilterContext.Provider value={value}>
      {children}
    </DashboardFilterContext.Provider>
  );
}

export function useDashboardFilter(): DashboardFilterValue {
  const ctx = useContext(DashboardFilterContext);
  if (ctx === null) {
    throw new Error(
      "useDashboardFilter must be used within <DashboardFilterProvider>",
    );
  }
  return ctx;
}
