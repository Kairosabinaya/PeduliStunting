"use client";

import { ChevronsUpDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { DASHBOARD_SIMULATOR } from "@/config/dashboard";
import { cn } from "@/lib/cn";

import type { SimulatorRegionOption } from "./predictor-simulator";

export interface RegionComboboxProps {
  readonly regions: readonly SimulatorRegionOption[];
  /** Selected region BPS code. */
  readonly value: string;
  readonly onChange: (kodeBps: string) => void;
  readonly ariaLabel: string;
}

interface ProvinceGroup {
  readonly provinsi: string;
  readonly items: readonly SimulatorRegionOption[];
}

function groupByProvince(
  regions: readonly SimulatorRegionOption[],
): readonly ProvinceGroup[] {
  const groups = new Map<string, SimulatorRegionOption[]>();
  for (const region of regions) {
    const bucket = groups.get(region.provinsi) ?? [];
    bucket.push(region);
    groups.set(region.provinsi, bucket);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], "id"))
    .map(([provinsi, items]) => ({ provinsi, items }));
}

/**
 * Searchable region picker. Replaces the native `<select>` (which forced a
 * browser scrollbar and offered no search) with a button-triggered panel: a
 * filter input narrows a province-grouped list as the user types, and the list
 * hides its scrollbar (`scrollbar-hide`). A menu-of-buttons pattern keeps it
 * keyboard-operable (Tab through results, Enter/Space to pick, Escape to
 * close) without hand-rolling listbox roving focus.
 */
export function RegionCombobox({
  regions,
  value,
  onChange,
  ariaLabel,
}: RegionComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = regions.find((region) => region.kodeBps === value) ?? null;

  const groups = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const matches =
      trimmed === ""
        ? regions
        : regions.filter(
            (region) =>
              region.kabupatenKota.toLowerCase().includes(trimmed) ||
              region.provinsi.toLowerCase().includes(trimmed),
          );
    return groupByProvince(matches);
  }, [regions, query]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent): void => {
      if (!(event.target instanceof Node)) return;
      if (wrapperRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function select(kodeBps: string): void {
    onChange(kodeBps);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 text-left text-sm text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <span className="truncate">
          {selected
            ? selected.kabupatenKota
            : DASHBOARD_SIMULATOR.regionPlaceholder}
        </span>
        <ChevronsUpDown
          className="h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </button>

      {open ? (
        <div className="absolute left-0 z-popover mt-1 w-full overflow-hidden rounded-md border border-border bg-surface shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={DASHBOARD_SIMULATOR.regionSearchPlaceholder}
              aria-label={DASHBOARD_SIMULATOR.regionSearchPlaceholder}
              className="h-10 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="scrollbar-hide max-h-72 overflow-y-auto py-1">
            {groups.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                {DASHBOARD_SIMULATOR.regionSearchEmpty}
              </p>
            ) : (
              groups.map((group) => (
                <div key={group.provinsi}>
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.provinsi}
                  </p>
                  {group.items.map((region) => {
                    const active = region.kodeBps === value;
                    return (
                      <button
                        key={region.kodeBps}
                        type="button"
                        onClick={() => select(region.kodeBps)}
                        className={cn(
                          "flex min-h-9 w-full items-center px-3 py-1.5 text-left text-sm transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none",
                          active
                            ? "font-semibold text-primary"
                            : "text-foreground",
                        )}
                      >
                        {region.kabupatenKota}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
